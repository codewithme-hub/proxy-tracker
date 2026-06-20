import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "bg-paper border border-rule rounded-2xl shadow-[0_2px_0_0_rgba(43,38,32,0.06)]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Field({ label, error, className, id, ...rest }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          "px-4 py-2.5 rounded-lg border border-rule bg-white/60",
          "focus:outline-none focus:ring-2 focus:ring-credit/50 focus:border-credit",
          "placeholder:text-ink-soft/50 text-ink",
          error && "border-debit focus:ring-debit/40 focus:border-debit",
          className
        )}
        {...rest}
      />
      {error && <span className="text-xs text-debit">{error}</span>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "credit" | "debit";
}) {
  return (
    <span
      className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full font-mono", {
        "bg-paper-dim text-ink-soft": tone === "neutral",
        "bg-credit-soft text-credit": tone === "credit",
        "bg-debit-soft text-debit": tone === "debit",
      })}
    >
      {children}
    </span>
  );
}
