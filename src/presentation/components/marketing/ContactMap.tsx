export function ContactMap({ embedUrl }: { embedUrl: string | null }) {
  if (!embedUrl) return null;
  return (
    <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--muted)] shadow-[var(--shadow-soft)]">
      <div className="pointer-events-none absolute inset-0 bg-[var(--muted)]" aria-hidden />
      <iframe
        title="Master Touch map"
        src={embedUrl}
        className="relative z-[1] h-80 w-full bg-[var(--muted)] md:h-[22rem]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
