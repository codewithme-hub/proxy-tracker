import mongoose, { Types } from "mongoose";
import { ProxyEntry } from "../models/ProxyEntry.js";

export interface PairRaw {
  userId: string;
  given: number; // proxies this user gave TO the other person
  received: number; // proxies this user received FROM the other person
}

export interface MemberBalance {
  userId: string;
  net: number; // positive = this member is owed (others owe them), negative = they owe
  given: number; // total proxies given (all-time within filter)
  received: number; // total proxies received
  perPartner: {
    userId: string;
    net: number; // positive = partner owes this member
    given: number;
    received: number;
  }[];
}

interface BalanceFilter {
  group: string;
  semester?: string;
  subject?: string;
}

/**
 * Computes net + raw balances for every member of a group from the ProxyEntry
 * collection directly. Nothing is cached or stored — the ledger is always the
 * single source of truth, so balances can never drift out of sync with entries.
 */
export async function computeGroupBalances(filter: BalanceFilter): Promise<MemberBalance[]> {
  const match: Record<string, unknown> = { group: new Types.ObjectId(filter.group) };
  if (filter.semester) match.semester = new Types.ObjectId(filter.semester);
  if (filter.subject) match.subject = filter.subject;

  // Aggregate pairwise totals: for every (givenBy, givenTo) pair, count entries.
  const pairTotals = await ProxyEntry.aggregate<{
    _id: { from: Types.ObjectId; to: Types.ObjectId };
    count: number;
  }>([
    { $match: match },
    {
      $group: {
        _id: { from: "$givenBy", to: "$givenTo" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Build a map of every user that appears, then fold pair totals into per-member,
  // per-partner structures.
  const memberMap = new Map<string, MemberBalance>();

  function ensureMember(id: string): MemberBalance {
    let m = memberMap.get(id);
    if (!m) {
      m = { userId: id, net: 0, given: 0, received: 0, perPartner: [] };
      memberMap.set(id, m);
    }
    return m;
  }

  function ensurePartner(member: MemberBalance, partnerId: string) {
    let p = member.perPartner.find((pp) => pp.userId === partnerId);
    if (!p) {
      p = { userId: partnerId, net: 0, given: 0, received: 0 };
      member.perPartner.push(p);
    }
    return p;
  }

  for (const row of pairTotals) {
    const fromId = row._id.from.toString();
    const toId = row._id.to.toString();
    const count = row.count;

    // fromId GAVE `count` proxies TO toId.
    const fromMember = ensureMember(fromId);
    fromMember.given += count;
    fromMember.net += count; // they are owed more
    const fromPartner = ensurePartner(fromMember, toId);
    fromPartner.given += count;
    fromPartner.net += count;

    // toId RECEIVED `count` proxies FROM fromId.
    const toMember = ensureMember(toId);
    toMember.received += count;
    toMember.net -= count; // they owe more
    const toPartner = ensurePartner(toMember, fromId);
    toPartner.received += count;
    toPartner.net -= count;
  }

  return Array.from(memberMap.values());
}

export interface RecentActivityItem {
  id: string;
  givenBy: string;
  givenTo: string;
  subject?: string;
  note?: string;
  date: Date;
}

export async function getRecentActivity(
  filter: BalanceFilter,
  limit = 20
): Promise<RecentActivityItem[]> {
  const match: Record<string, unknown> = { group: new Types.ObjectId(filter.group) };
  if (filter.semester) match.semester = new Types.ObjectId(filter.semester);
  if (filter.subject) match.subject = filter.subject;

  const entries = await ProxyEntry.find(match).sort({ date: -1, createdAt: -1 }).limit(limit);

  return entries.map((e) => ({
    id: e._id.toString(),
    givenBy: e.givenBy.toString(),
    givenTo: e.givenTo.toString(),
    subject: e.subject,
    note: e.note,
    date: e.date,
  }));
}
