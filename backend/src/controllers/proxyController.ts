import type { Response } from "express";
import { z } from "zod";
import { ProxyEntry } from "../models/ProxyEntry.js";
import { Semester } from "../models/Semester.js";
import { computeGroupBalances, getRecentActivity } from "../services/balanceService.js";
import type { GroupScopedRequest } from "../middleware/requireGroupMember.js";

const createEntrySchema = z.object({
  semesterId: z.string().min(1),
  givenTo: z.string().min(1),
  subject: z.string().trim().max(60).optional(),
  date: z.string().datetime().optional(),
  note: z.string().trim().max(200).optional(),
});

function publicEntry(e: any) {
  return {
    id: e._id.toString(),
    semester: e.semester.toString(),
    subject: e.subject,
    givenBy: e.givenBy.toString(),
    givenTo: e.givenTo.toString(),
    date: e.date,
    note: e.note,
    createdAt: e.createdAt,
  };
}

export async function createEntry(req: GroupScopedRequest, res: Response) {
  const parsed = createEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
  }
  const { semesterId, givenTo, subject, date, note } = parsed.data;

  if (givenTo === req.userId) {
    return res.status(400).json({ message: "You can't mark a proxy for yourself" });
  }

  const isMember = req.group!.members.some((m) => m.user.toString() === givenTo);
  if (!isMember) {
    return res.status(400).json({ message: "That person isn't in this group" });
  }

  const semester = await Semester.findOne({ _id: semesterId, group: req.group!._id });
  if (!semester) {
    return res.status(404).json({ message: "Semester not found in this group" });
  }

  const entry = await ProxyEntry.create({
    group: req.group!._id,
    semester: semesterId,
    subject,
    givenBy: req.userId,
    givenTo,
    date: date ? new Date(date) : new Date(),
    note,
  });

  res.status(201).json({ entry: publicEntry(entry) });
}

export async function listEntries(req: GroupScopedRequest, res: Response) {
  const { semesterId, subject, limit } = req.query;
  const match: Record<string, unknown> = { group: req.group!._id };
  if (semesterId) match.semester = semesterId;
  if (subject) match.subject = subject;

  const entries = await ProxyEntry.find(match)
    .sort({ date: -1, createdAt: -1 })
    .limit(limit ? Math.min(Number(limit), 200) : 100);

  res.json({ entries: entries.map(publicEntry) });
}

export async function deleteEntry(req: GroupScopedRequest, res: Response) {
  const entry = await ProxyEntry.findOne({ _id: req.params.entryId, group: req.group!._id });
  if (!entry) return res.status(404).json({ message: "Entry not found" });

  // Only the person who logged it (or a group admin) can delete it — prevents
  // someone erasing proxies that were logged on their behalf.
  const isOwner = entry.givenBy.toString() === req.userId;
  if (!isOwner && req.groupRole !== "admin") {
    return res.status(403).json({ message: "Only the person who logged this, or an admin, can delete it" });
  }

  await entry.deleteOne();
  res.json({ message: "Entry deleted" });
}

export async function getBalances(req: GroupScopedRequest, res: Response) {
  const { semesterId, subject } = req.query;
  const balances = await computeGroupBalances({
    group: req.group!._id.toString(),
    semester: semesterId as string | undefined,
    subject: subject as string | undefined,
  });
  res.json({ balances });
}

export async function getActivity(req: GroupScopedRequest, res: Response) {
  const { semesterId, subject, limit } = req.query;
  const activity = await getRecentActivity(
    {
      group: req.group!._id.toString(),
      semester: semesterId as string | undefined,
      subject: subject as string | undefined,
    },
    limit ? Math.min(Number(limit), 100) : 20
  );
  res.json({ activity });
}
