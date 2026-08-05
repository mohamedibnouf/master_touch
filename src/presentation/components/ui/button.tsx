import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-normal rounded-[var(--radius)] text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 sm:whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[color-mix(in_oklab,var(--primary)_88%,white)]",
        accent:
          "bg-[var(--accent)] text-white shadow-[var(--shadow-cta)] hover:brightness-110 hover:shadow-[var(--shadow-cta-hover)]",
        outline:
          "border border-[var(--line)] bg-transparent text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
        ghost: "text-[var(--foreground)] hover:bg-[var(--muted)]",
        secondary: "bg-[var(--secondary)] text-white hover:opacity-90",
        light:
          "border border-white/35 bg-white/10 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-[var(--primary)]",
      },
      size: {
        default: "min-h-11 h-11 px-5 sm:px-6",
        sm: "min-h-10 h-10 px-3.5 text-xs",
        lg: "min-h-12 h-12 px-6 text-base sm:px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
