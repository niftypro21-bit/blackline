import Link from "next/link";

export function StatTile({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <div className="rounded-lg border border-border bg-panel px-5 py-4 transition-colors hover:border-accent/40">
      <p className="font-display text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 text-3xl text-foreground">{value}</p>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
