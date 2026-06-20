import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useAuthStore } from "../store/authStore";
import { Avatar } from "./ui/Avatar";
import { logout as logoutApi } from "../api/auth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: TallyIcon },
  { to: "/ledger", label: "Ledger", icon: BookIcon },
  { to: "/stats", label: "Stats", icon: ChartIcon },
  { to: "/settings", label: "Settings", icon: GearIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutApi();
    } finally {
      clearSession();
      navigate("/login");
    }
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-rule flex flex-col py-6 px-4 bg-paper-dim/40">
        <div className="font-display text-2xl font-semibold px-2 mb-8">Tab</div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-ink text-paper" : "text-ink-soft hover:bg-white/60"
                )
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="flex items-center gap-2.5 px-2 pt-4 border-t border-rule">
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-ink-soft hover:text-debit transition-colors p-1"
              aria-label="Log out"
              title="Log out"
            >
              <LogoutIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

function TallyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 4v16M10 4v16M15 4v16M20 4l-8 16" strokeLinecap="round" />
    </svg>
  );
}
function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19a2 2 0 002 2h13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V9M11 19V4M18 19v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
