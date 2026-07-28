import { cn } from "@/lib/utils";

export function LoadingState({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-white/60 p-8"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/70 p-10 text-center">
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
      className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800"
    >
      <p className="font-semibold">{title}</p>
      {description ? <p className="mt-2 text-sm opacity-80">{description}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
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
        "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800",
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
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="confirm-title" className="text-lg font-semibold text-[var(--primary)]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
