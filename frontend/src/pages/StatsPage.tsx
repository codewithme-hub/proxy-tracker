import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AppShell } from "../components/AppShell";
import { Card } from "../components/ui/primitives";
import { Avatar } from "../components/ui/Avatar";
import { useActiveGroup } from "../hooks/useActiveGroup";
import { getBalances } from "../api/proxies";
import { GroupEmptyState } from "../components/GroupEmptyState";

export function StatsPage() {
  const { groupId, membersById, semesters, activeSemester, hasGroup } = useActiveGroup();

  const balancesQuery = useQuery({
    queryKey: ["balances", groupId, activeSemester?.id],
    queryFn: () => getBalances(groupId!, { semesterId: activeSemester?.id }),
    enabled: !!groupId && !!activeSemester,
  });

  if (!hasGroup) {
    return (
      <AppShell>
        <GroupEmptyState />
      </AppShell>
    );
  }

  const balances = balancesQuery.data ?? [];
  const maxGiven = Math.max(1, ...balances.map((b) => b.given));
  const sorted = [...balances].sort((a, b) => b.given - a.given);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-8 py-10">
        <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-1">
          {activeSemester?.name ?? "All time"}
        </p>
        <h1 className="font-display text-3xl font-medium mb-8">Who's carried the squad</h1>

        <Card className="p-6 mb-8">
          <div className="space-y-5">
            {sorted.map((b, i) => {
              const member = membersById.get(b.userId);
              return (
                <div key={b.userId} className="flex items-center gap-4">
                  <span className="font-display text-lg text-ink-soft w-5">{i + 1}</span>
                  <Avatar name={member?.name ?? "?"} avatarUrl={member?.avatarUrl} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{member?.name}</span>
                      <span className="text-sm font-mono text-ink-soft">{b.given} given</span>
                    </div>
                    <div className="h-2 bg-paper-dim rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(b.given / maxGiven) * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                        className="h-full bg-credit rounded-full"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {sorted.length === 0 && (
              <p className="text-sm text-ink-soft">No data yet for this semester.</p>
            )}
          </div>
        </Card>

        <div className="grid sm:grid-cols-3 gap-4">
          {sorted.map((b) => {
            const member = membersById.get(b.userId);
            return (
              <Card key={b.userId} className="p-5 text-center">
                <Avatar name={member?.name ?? "?"} avatarUrl={member?.avatarUrl} className="mx-auto mb-3" />
                <p className="font-medium mb-1">{member?.name}</p>
                <p
                  className={`font-display text-2xl ${
                    b.net > 0 ? "text-credit" : b.net < 0 ? "text-debit" : "text-ink-soft"
                  }`}
                >
                  {b.net > 0 ? "+" : ""}
                  {b.net}
                </p>
                <p className="text-xs text-ink-soft">net this semester</p>
              </Card>
            );
          })}
        </div>

        {semesters.length > 1 && (
          <p className="text-xs text-ink-soft mt-8 text-center">
            Showing {activeSemester?.name}. Switch semesters from the ledger filter.
          </p>
        )}
      </div>
    </AppShell>
  );
}
