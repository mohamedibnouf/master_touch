import { cn } from "@/lib/utils";

export function LoadingState({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--surface)] p-8"
    >
      <span className="h-8 w-8 animate-spin rounded-[var(--radius)] border-2 border-[var(--accent)] border-t-transparent" />
      <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--surface)] p-10 text-center">
      <p className="font-semibold text-[var(--primary)]">{title}</p>
      {description ? <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p> : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel,
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-[var(--radius)] border border-[var(--warning)]/30 bg-[color-mix(in_oklab,var(--warning)_8%,white)] p-8 text-center text-[var(--primary)]"
    >
      <p className="font-semibold">{title}</p>
      {description ? <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-[var(--radius)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          {retryLabel ?? "Retry"}
        </button>
      ) : null}
    </div>
  );
}

export function SuccessBanner({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-[var(--radius)] border border-[var(--line)] bg-[var(--muted)] px-4 py-3 text-sm font-medium text-[var(--primary)]",
        className,
      )}
    >
      {message}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="w-full max-w-md rounded-[var(--radius)] bg-white p-6 shadow-[var(--shadow-lift)]">
        <h2 id="confirm-title" className="text-lg font-semibold text-[var(--primary)]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[var(--radius)] border border-[var(--line)] px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-[var(--radius)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
