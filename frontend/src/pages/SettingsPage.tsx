import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Card, Field, Badge } from "../components/ui/primitives";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { useActiveGroup } from "../hooks/useActiveGroup";
import { useAuthStore } from "../store/authStore";
import { leaveGroup } from "../api/groups";
import { createSemester, updateSemester } from "../api/semesters";
import { GroupEmptyState } from "../components/GroupEmptyState";

export function SettingsPage() {
  const me = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { groupId, group, semesters, hasGroup } = useActiveGroup();
  const [copied, setCopied] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState("");

  const myRole = group?.members.find((m) => m.userId === me?.id)?.role;

  const leaveMutation = useMutation({
    mutationFn: () => leaveGroup(groupId!),
    onSuccess: () => {
      updateUser({ activeGroup: null });
      navigate("/onboarding");
    },
  });

  const createSemesterMutation = useMutation({
    mutationFn: () => createSemester(groupId!, { name: newSemesterName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters", groupId] });
      setNewSemesterName("");
    },
  });

  const activateSemesterMutation = useMutation({
    mutationFn: (semesterId: string) =>
      updateSemester(groupId!, semesterId, { makeActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters", groupId] });
    },
  });

  if (!hasGroup || !group) {
    return (
      <AppShell>
        <GroupEmptyState />
      </AppShell>
    );
  }

  function copyInvite() {
    navigator.clipboard.writeText(group!.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleCreateSemester(e: FormEvent) {
    e.preventDefault();
    if (newSemesterName.trim()) createSemesterMutation.mutate();
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-8 py-10">
        <h1 className="font-display text-3xl font-medium mb-8">Settings</h1>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-medium">{group.name}</h2>
            {myRole && <Badge tone="neutral">you're {myRole}</Badge>}
          </div>
          <Card className="p-5 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-ink-soft">Invite code</span>
              <button
                onClick={copyInvite}
                className="font-mono text-sm font-semibold tracking-widest bg-paper-dim px-3 py-1.5 rounded-lg hover:bg-rule transition-colors"
              >
                {copied ? "Copied!" : group.inviteCode}
              </button>
            </div>
            <p className="text-xs text-ink-soft">
              Share this code so others can join (max {group.maxMembers} members).
            </p>
          </Card>

          <div className="flex flex-col gap-2">
            {group.members.map((m) => (
              <Card key={m.userId} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={m.name ?? "?"} avatarUrl={m.avatarUrl} size="sm" />
                  <span className="text-sm font-medium">{m.name}</span>
                  {m.userId === me?.id && <span className="text-xs text-ink-soft">(you)</span>}
                </div>
                {m.role === "admin" && <Badge tone="neutral">admin</Badge>}
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-lg font-medium mb-3">Semesters</h2>
          <Card className="divide-y divide-rule mb-4">
            {semesters.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium">{s.name}</span>
                {s.isActive ? (
                  <Badge tone="credit">active</Badge>
                ) : (
                  <button
                    onClick={() => activateSemesterMutation.mutate(s.id)}
                    className="text-xs text-credit hover:underline font-medium"
                  >
                    Make active
                  </button>
                )}
              </div>
            ))}
            {semesters.length === 0 && (
              <p className="p-4 text-sm text-ink-soft">No semesters yet.</p>
            )}
          </Card>
          <form onSubmit={handleCreateSemester} className="flex gap-2">
            <Field
              placeholder="New semester name"
              value={newSemesterName}
              onChange={(e) => setNewSemesterName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="secondary" disabled={createSemesterMutation.isPending}>
              Add
            </Button>
          </form>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-3 text-debit">Danger zone</h2>
          <Card className="p-5">
            <p className="text-sm text-ink-soft mb-4">
              Leaving removes you from {group.name}. Your past entries stay on the record.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => leaveMutation.mutate()}
              disabled={leaveMutation.isPending}
            >
              {leaveMutation.isPending ? "Leaving…" : "Leave group"}
            </Button>
            {leaveMutation.isError && (
              <p className="text-sm text-debit mt-2">
                {(leaveMutation.error as any)?.response?.data?.message ?? "Couldn't leave the group."}
              </p>
            )}
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
