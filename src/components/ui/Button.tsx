import { clsx } from "clsx";
import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm transition-colors disabled:opacity-50 disabled:pointer-events-none";
const variants = {
  primary: "border border-accent/50 bg-accent-soft text-accent hover:border-accent",
  ghost: "border border-border text-muted hover:text-foreground hover:border-foreground/30",
  danger: "border border-status-refused/40 text-status-refused hover:border-status-refused",
};

type Variant = keyof typeof variants;

export function Button({
  children,
  className,
  variant = "ghost",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  className,
  variant = "ghost",
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  variant?: Variant;
}) {
  return (
    <Link href={href} className={clsx(base, variants[variant], className)}>
      {children}
    </Link>
  );
}
