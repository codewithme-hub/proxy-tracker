import { Link } from "react-router-dom";
import { Button } from "./ui/Button";

export function GroupEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[80vh] px-6 text-center">
      <svg
        className="w-12 h-12 text-ink-soft mb-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M11 7a4 4 0 11-8 0 4 4 0 018 0zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h1 className="font-display text-2xl font-medium mb-2">No group yet</h1>
      <p className="text-ink-soft max-w-sm mb-6">
        Create a tab with your squad or join one with an invite code to start tracking proxies.
      </p>
      <Link to="/onboarding">
        <Button>Set up a group</Button>
      </Link>
    </div>
  );
}
