import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AppShell } from "../components/AppShell";
import { Card, Badge } from "../components/ui/primitives";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { AddProxyModal } from "../components/AddProxyModal";
import { useActiveGroup } from "../hooks/useActiveGroup";
import { useAuthStore } from "../store/authStore";
import { getBalances, getActivity } from "../api/proxies";
import { GroupEmptyState } from "../components/GroupEmptyState";
import { NoSemesterState } from "../components/NoSemesterState";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const me = useAuthStore((s) => s.user);
  const { groupId, group, membersById, semesters, activeSemester, isLoading, hasGroup } =
    useActiveGroup();
  const [showAddModal, setShowAddModal] = useState(false);

  const balancesQuery = useQuery({
    queryKey: ["balances", groupId, activeSemester?.id],
    queryFn: () => getBalances(groupId!, { semesterId: activeSemester?.id }),
    enabled: !!groupId && !!activeSemester,
  });

  const activityQuery = useQuery({
    queryKey: ["activity", groupId, activeSemester?.id],
    queryFn: () => getActivity(groupId!, { semesterId: activeSemester?.id, limit: 8 }),
    enabled: !!groupId && !!activeSemester,
  });

  if (!hasGroup) {
    return (
      <AppShell>
        <GroupEmptyState />
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-10 text-ink-soft font-display animate-pulse">Loading your tab…</div>
      </AppShell>
    );
  }

  if (semesters.length === 0) {
    return (
      <AppShell>
        <NoSemesterState groupId={groupId!} />
      </AppShell>
    );
  }

  const myBalance = balancesQuery.data?.find((b) => b.userId === me?.id);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-1">
              {group?.name} · {activeSemester?.name}
            </p>
            <h1 className="font-display text-3xl font-medium">
              {greeting()}, {me?.name?.split(" ")[0]}
            </h1>
          </div>
          <Button onClick={() => setShowAddModal(true)}>+ Mark a proxy</Button>
        </div>

        {myBalance && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-soft mb-1">Your overall standing</p>
                <p
                  className={`font-display text-4xl font-medium ${
                    myBalance.net > 0
                      ? "text-credit"
                      : myBalance.net < 0
                        ? "text-debit"
                        : "text-ink-soft"
                  }`}
                >
                  {myBalance.net > 0 ? "+" : ""}
                  {myBalance.net}
                </p>
                <p className="text-sm text-ink-soft mt-1">
                  {myBalance.net > 0
                    ? "you're owed, net"
                    : myBalance.net < 0
                      ? "you owe, net"
                      : "all settled up"}
                </p>
              </div>
              <div className="flex gap-6 text-right">
                <div>
                  <p className="font-display text-2xl">{myBalance.given}</p>
                  <p className="text-xs text-ink-soft">given</p>
                </div>
                <div>
                  <p className="font-display text-2xl">{myBalance.received}</p>
                  <p className="text-xs text-ink-soft">received</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <h2 className="font-display text-lg font-medium mb-3">With each other</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {myBalance?.perPartner.map((p) => {
            const partner = membersById.get(p.userId);
            return (
              <Card key={p.userId} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={partner?.name ?? "?"} avatarUrl={partner?.avatarUrl} />
                  <div>
                    <p className="font-medium">{partner?.name ?? "Member"}</p>
                    <p className="text-xs text-ink-soft">
                      {p.given} given · {p.received} received
                    </p>
                  </div>
                </div>
                <Badge tone={p.net > 0 ? "credit" : p.net < 0 ? "debit" : "neutral"}>
                  {p.net > 0 ? `owes you ${p.net}` : p.net < 0 ? `you owe ${Math.abs(p.net)}` : "even"}
                </Badge>
              </Card>
            );
          })}
          {(!myBalance || myBalance.perPartner.length === 0) && (
            <p className="text-sm text-ink-soft col-span-2">
              No proxies logged yet this semester. Mark one to get started.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-medium">Recent activity</h2>
          <Link to="/ledger" className="text-sm text-credit hover:underline font-medium">
            View full ledger →
          </Link>
        </div>
        <Card className="divide-y divide-rule">
          {activityQuery.data?.length === 0 && (
            <p className="p-5 text-sm text-ink-soft">Nothing logged yet.</p>
          )}
          {activityQuery.data?.map((item) => {
            const giver = membersById.get(item.givenBy);
            const receiver = membersById.get(item.givenTo);
            return (
              <div key={item.id} className="p-4 flex items-center gap-3">
                <Avatar name={giver?.name ?? "?"} avatarUrl={giver?.avatarUrl} size="sm" />
                <div className="flex-1 text-sm">
                  <span className="font-medium">{giver?.name}</span>
                  <span className="text-ink-soft"> covered for </span>
                  <span className="font-medium">{receiver?.name}</span>
                  {item.subject && <span className="text-ink-soft"> in {item.subject}</span>}
                  {item.note && <span className="text-ink-soft italic"> — {item.note}</span>}
                </div>
                <span className="text-xs text-ink-soft font-mono whitespace-nowrap">
                  {formatDate(item.date)}
                </span>
              </div>
            );
          })}
        </Card>
      </div>

      {showAddModal && groupId && (
        <AddProxyModal
          groupId={groupId}
          members={group?.members ?? []}
          semesters={semesters}
          activeSemesterId={activeSemester?.id}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </AppShell>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return "Today";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
