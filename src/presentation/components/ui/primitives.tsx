import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-[var(--foreground)]", className)}
      {...props}
    />
  );
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-28 w-full max-w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 text-base shadow-sm placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-panel rounded-[var(--radius)] p-6 shadow-[var(--shadow-soft)]", className)}
      {...props}
    />
  );
}

export function Badge({
  className,
  ...props
}: React.ComponentProps<"span"> & { variant?: "default" | "accent" | "outline" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius)] px-2.5 py-0.5 text-xs font-semibold",
        "bg-[var(--muted)] text-[var(--foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export function Separator({ className, ...props }: React.ComponentProps<"hr">) {
  return <hr className={cn("border-0 border-t border-[var(--border)]", className)} {...props} />;
}

export function Switch({
  checked,
  onCheckedChange,
  id,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-[var(--radius)] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        checked ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)] bg-[var(--muted)]",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 translate-x-0.5 rounded-[var(--radius)] bg-white shadow transition-transform",
          checked && "translate-x-[1.35rem]",
        )}
      />
    </button>
  );
}
