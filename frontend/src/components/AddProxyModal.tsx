import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Field } from "./ui/primitives";
import { createEntry } from "../api/proxies";
import { useAuthStore } from "../store/authStore";
import type { GroupMember, Semester } from "../types";

interface AddProxyModalProps {
  groupId: string;
  members: GroupMember[];
  semesters: Semester[];
  activeSemesterId?: string;
  onClose: () => void;
}

export function AddProxyModal({
  groupId,
  members,
  semesters,
  activeSemesterId,
  onClose,
}: AddProxyModalProps) {
  const me = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [givenTo, setGivenTo] = useState<string | null>(null);
  const [semesterId, setSemesterId] = useState(activeSemesterId ?? semesters[0]?.id ?? "");
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  const [stamped, setStamped] = useState(false);

  const otherMembers = members.filter((m) => m.userId !== me?.id);

  const mutation = useMutation({
    mutationFn: () =>
      createEntry(groupId, {
        semesterId,
        givenTo: givenTo!,
        subject: subject.trim() || undefined,
        note: note.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balances", groupId] });
      queryClient.invalidateQueries({ queryKey: ["activity", groupId] });
      setStamped(true);
      setTimeout(onClose, 850);
    },
  });

  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-paper border border-rule rounded-2xl w-full max-w-md p-7 shadow-xl relative overflow-hidden"
      >
        <AnimatePresence>
          {stamped && (
            <motion.div
              initial={{ opacity: 0, scale: 1.4, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="absolute inset-0 flex items-center justify-center bg-paper/90 z-10"
            >
              <div className="border-4 border-stamp text-stamp font-display font-bold text-3xl px-6 py-3 rounded-xl -rotate-6">
                Logged!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <h2 className="font-display text-2xl font-medium mb-1">Mark a proxy</h2>
        <p className="text-sm text-ink-soft mb-6">Who'd you cover for?</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {otherMembers.map((m) => (
            <button
              key={m.userId}
              onClick={() => setGivenTo(m.userId)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                givenTo === m.userId
                  ? "border-credit bg-credit-soft/40"
                  : "border-rule hover:border-ink-soft/40"
              }`}
            >
              <Avatar name={m.name ?? "?"} avatarUrl={m.avatarUrl} size="md" />
              <span className="text-sm font-medium truncate w-full text-center">
                {m.name?.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>

        {semesters.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-ink-soft mb-1.5 block">Semester</label>
            <select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-rule bg-white/60 focus:outline-none focus:ring-2 focus:ring-credit/50"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Field
          label="Subject (optional)"
          placeholder="e.g. DBMS"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mb-4"
        />
        <Field
          label="Note (optional)"
          placeholder="e.g. 2nd hour, skipped for interview"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mb-6"
        />

        {mutation.isError && (
          <p className="text-sm text-debit mb-4">
            {(mutation.error as any)?.response?.data?.message ?? "Couldn't log that. Try again."}
          </p>
        )}

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!givenTo || !semesterId || mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending ? "Logging…" : "Log proxy"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
