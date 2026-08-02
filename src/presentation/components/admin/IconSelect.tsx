"use client";

import { useState } from "react";
import { Label } from "@/presentation/components/ui/primitives";
import { cn } from "@/lib/utils";
import { ADMIN_ICON_OPTIONS } from "@/presentation/components/admin/icon-options";

export function IconSelect({
  name,
  label = "Icon",
  defaultValue,
  className,
}: {
  name: string;
  label?: string;
  defaultValue?: string | null;
  className?: string;
}) {
  const initial =
    ADMIN_ICON_OPTIONS.find((o) => o.value === defaultValue)?.value ??
    ADMIN_ICON_OPTIONS[0]?.value ??
    "Zap";
  const [value, setValue] = useState(initial);

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={value} />
      <div
        className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
        role="radiogroup"
        aria-label={label}
      >
        {ADMIN_ICON_OPTIONS.map(({ value: option, label: optionLabel, Icon }) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              title={optionLabel}
              onClick={() => setValue(option)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-[0.65rem] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                selected
                  ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_12%,white)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="max-w-full truncate">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
