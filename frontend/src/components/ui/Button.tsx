import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "font-body font-semibold rounded-lg transition-all duration-150 inline-flex items-center justify-center gap-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-[0.98]",
        {
          "bg-ink text-paper hover:bg-ink/90 shadow-sm": variant === "primary",
          "bg-transparent text-ink border-2 border-ink hover:bg-ink hover:text-paper":
            variant === "secondary",
          "bg-transparent text-ink-soft hover:bg-paper-dim": variant === "ghost",
          "bg-debit text-paper hover:bg-debit/90": variant === "danger",
        },
        {
          "text-sm px-3 py-1.5": size === "sm",
          "text-base px-5 py-2.5": size === "md",
          "text-lg px-7 py-3.5": size === "lg",
        },
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
