import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <p className="font-display text-sm uppercase tracking-wider text-muted">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-3 rounded-md border border-accent/40 bg-accent-soft px-3 py-1.5 text-sm text-accent transition-colors hover:border-accent"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
