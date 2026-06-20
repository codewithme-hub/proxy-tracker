import clsx from "clsx";

const PALETTE = ["#C97F2A", "#2F6B4F", "#A8432E", "#5C5347", "#7A5C8E"];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = { sm: "w-7 h-7 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" }[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={clsx(dims, "rounded-full object-cover border-2 border-paper shadow-sm", className)}
      />
    );
  }

  return (
    <div
      className={clsx(
        dims,
        "rounded-full flex items-center justify-center font-display font-semibold text-paper border-2 border-paper shadow-sm",
        className
      )}
      style={{ backgroundColor: colorFor(name || "?") }}
    >
      {initials(name || "?")}
    </div>
  );
}
