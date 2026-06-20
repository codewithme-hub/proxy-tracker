import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Card, Field } from "../components/ui/primitives";
import { createGroup, joinGroup } from "../api/groups";
import { useAuthStore } from "../store/authStore";

export function OnboardingPage() {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const navigate = useNavigate();
  const updateUser = useAuthStore((s) => s.updateUser);

  function handleGroupReady(groupId: string) {
    updateUser({ activeGroup: groupId });
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-medium mb-2">Find your squad</h1>
          <p className="text-ink-soft">Tab works in groups of 2 to 4.</p>
        </div>

        <AnimatePresence mode="wait">
          {mode === "choose" && (
            <motion.div
              key="choose"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <button
                onClick={() => setMode("create")}
                className="text-left p-5 border border-rule rounded-2xl bg-white/40 hover:bg-white/70 transition-colors"
              >
                <div className="font-display text-lg mb-1">Start a new tab</div>
                <div className="text-sm text-ink-soft">
                  Create a group and invite your friends with a code.
                </div>
              </button>
              <button
                onClick={() => setMode("join")}
                className="text-left p-5 border border-rule rounded-2xl bg-white/40 hover:bg-white/70 transition-colors"
              >
                <div className="font-display text-lg mb-1">Join with a code</div>
                <div className="text-sm text-ink-soft">
                  Someone already started one? Hop in with their invite code.
                </div>
              </button>
            </motion.div>
          )}

          {mode === "create" && (
            <CreateGroupForm key="create" onBack={() => setMode("choose")} onCreated={handleGroupReady} />
          )}

          {mode === "join" && (
            <JoinGroupForm key="join" onBack={() => setMode("choose")} onJoined={handleGroupReady} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CreateGroupForm({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: (groupId: string) => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const group = await createGroup(name);
      onCreated(group.id);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Couldn't create the group.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Card className="p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Group name"
            placeholder="Hostel Trio, CS Squad…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          {error && <p className="text-sm text-debit">{error}</p>}
          <div className="flex gap-3 mt-2">
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating…" : "Create group"}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}

function JoinGroupForm({
  onBack,
  onJoined,
}: {
  onBack: () => void;
  onJoined: (groupId: string) => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const group = await joinGroup(code);
      onJoined(group.id);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "That code didn't work.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Card className="p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Invite code"
            placeholder="e.g. 7XQK2LMN"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            autoFocus
            className="font-mono tracking-widest"
          />
          {error && <p className="text-sm text-debit">{error}</p>}
          <div className="flex gap-3 mt-2">
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Joining…" : "Join group"}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
