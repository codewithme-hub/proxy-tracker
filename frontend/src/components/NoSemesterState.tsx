import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Field } from "./ui/primitives";
import { Button } from "./ui/Button";
import { createSemester } from "../api/semesters";

export function NoSemesterState({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => createSemester(groupId, { name, makeActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters", groupId] });
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Couldn't create that semester.");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <h1 className="font-display text-2xl font-medium mb-2">Set up your first semester</h1>
      <p className="text-ink-soft max-w-sm mb-6">
        Proxies are tracked per semester so your tally resets cleanly term to term.
      </p>
      <Card className="p-6 w-full max-w-xs text-left">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Semester name"
            placeholder="e.g. Sem 5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          {error && <p className="text-sm text-debit">{error}</p>}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create semester"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
