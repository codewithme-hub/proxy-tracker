import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 sm:px-10 py-6">
        <div className="font-display text-2xl font-semibold tracking-tight">Tab</div>
        <nav className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">
              Sign up
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="font-mono text-sm text-ink-soft uppercase tracking-[0.2em] mb-4">
            for the squad that covers for each other
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-medium leading-[1.05] mb-6">
            Who marked attendance for who, <span className="italic text-credit">tracked.</span>
          </h1>
          <p className="text-lg text-ink-soft max-w-lg mx-auto mb-10 leading-relaxed">
            You and your crew cover proxies for each other every semester. Tab keeps the
            tally so nobody's keeping score in their head — or losing track of who owes
            who a free one.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg">Start a tab</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                I have an account
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mt-20 w-full max-w-3xl"
        >
          <LedgerPreview />
        </motion.div>
      </main>

      <footer className="px-6 sm:px-10 py-6 text-center text-sm text-ink-soft/70">
        Built for squads of 2 to 4. No card needed.
      </footer>
    </div>
  );
}

function LedgerPreview() {
  const rows = [
    { name: "Aarav", role: "covered for you 4 times", net: "+3", tone: "credit" as const },
    { name: "Priya", role: "you covered 2 times", net: "−2", tone: "debit" as const },
    { name: "Devansh", role: "even steven", net: "0", tone: "neutral" as const },
  ];

  return (
    <div className="bg-white/50 border border-rule rounded-2xl p-6 sm:p-8 text-left shadow-[0_4px_0_0_rgba(43,38,32,0.05)]">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-rule">
        <span className="font-display text-xl">Sem 5 — Hostel Trio</span>
        <span className="font-mono text-xs text-ink-soft">12 entries this sem</span>
      </div>
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-ink-soft">{r.role}</div>
            </div>
            <span
              className={`font-display text-2xl font-medium ${
                r.tone === "credit"
                  ? "text-credit"
                  : r.tone === "debit"
                    ? "text-debit"
                    : "text-ink-soft"
              }`}
            >
              {r.net}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
