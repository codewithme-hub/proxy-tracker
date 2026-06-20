import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "../components/AppShell";
import { Card } from "../components/ui/primitives";
import { Avatar } from "../components/ui/Avatar";
import { useActiveGroup } from "../hooks/useActiveGroup";
import { useAuthStore } from "../store/authStore";
import { listEntries, deleteEntry } from "../api/proxies";
import { GroupEmptyState } from "../components/GroupEmptyState";

export function LedgerPage() {
  const me = useAuthStore((s) => s.user);
  const { groupId, membersById, semesters, hasGroup } = useActiveGroup();
  const [semesterFilter, setSemesterFilter] = useState<string>("");
  const queryClient = useQueryClient();

  const entriesQuery = useQuery({
    queryKey: ["entries", groupId, semesterFilter],
    queryFn: () => listEntries(groupId!, semesterFilter ? { semesterId: semesterFilter } : undefined),
    enabled: !!groupId,
  });

  const deleteMutation = useMutation({
    mutationFn: (entryId: string) => deleteEntry(groupId!, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", groupId] });
      queryClient.invalidateQueries({ queryKey: ["balances", groupId] });
      queryClient.invalidateQueries({ queryKey: ["activity", groupId] });
    },
  });

  if (!hasGroup) {
    return (
      <AppShell>
        <GroupEmptyState />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-medium">The ledger</h1>
          {semesters.length > 0 && (
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-rule bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-credit/50"
            >
              <option value="">All semesters</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <Card className="divide-y divide-rule">
          {entriesQuery.isLoading && <p className="p-6 text-ink-soft text-sm">Loading…</p>}
          {entriesQuery.data?.length === 0 && (
            <p className="p-6 text-ink-soft text-sm">No entries yet for this filter.</p>
          )}
          {entriesQuery.data?.map((entry) => {
            const giver = membersById.get(entry.givenBy);
            const receiver = membersById.get(entry.givenTo);
            const canDelete = entry.givenBy === me?.id;

            return (
              <div key={entry.id} className="p-4 flex items-center gap-3 group">
                <Avatar name={giver?.name ?? "?"} avatarUrl={giver?.avatarUrl} size="sm" />
                <div className="flex-1 text-sm">
                  <span className="font-medium">{giver?.name}</span>
                  <span className="text-ink-soft"> → </span>
                  <span className="font-medium">{receiver?.name}</span>
                  {entry.subject && (
                    <span className="text-ink-soft"> · {entry.subject}</span>
                  )}
                  {entry.note && <p className="text-ink-soft italic text-xs mt-0.5">{entry.note}</p>}
                </div>
                <span className="text-xs text-ink-soft font-mono whitespace-nowrap">
                  {new Date(entry.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {canDelete && (
                  <button
                    onClick={() => deleteMutation.mutate(entry.id)}
                    className="opacity-0 group-hover:opacity-100 text-ink-soft hover:text-debit transition-opacity p-1"
                    aria-label="Delete entry"
                    title="Delete entry"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </Card>
      </div>
    </AppShell>
  );
}
