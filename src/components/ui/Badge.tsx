import { clsx } from "clsx";
import {
  labelFor,
  RELIABILITIES,
  VISIBILITIES,
  type Reliability,
  type Visibility,
} from "@/lib/constants";

export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "accent";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs tracking-wide",
        tone === "accent"
          ? "border-accent/40 bg-accent-soft text-accent"
          : "border-border bg-panel-raised text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

const RELIABILITY_DOT: Record<Reliability, string> = {
  CONFIRMED: "bg-reliability-confirmed",
  PROBABLE: "bg-reliability-probable",
  UNVERIFIED: "bg-reliability-unverified",
  CONTRADICTORY: "bg-reliability-contradictory",
};

export function ReliabilityBadge({ value }: { value: Reliability | null | undefined }) {
  const reliability = value ?? "UNVERIFIED";
  return (
    <Badge>
      <span className={clsx("h-1.5 w-1.5 rounded-full", RELIABILITY_DOT[reliability])} />
      {labelFor(RELIABILITIES, reliability)}
    </Badge>
  );
}

const VISIBILITY_ICON: Record<Visibility, string> = {
  PRIVATE: "\u{1F512}",
  SHARED: "\u{1F465}",
  RESTRICTED: "\u{26A0}",
};

export function VisibilityBadge({ value }: { value: Visibility | null | undefined }) {
  const visibility = value ?? "PRIVATE";
  return (
    <Badge>
      <span aria-hidden>{VISIBILITY_ICON[visibility]}</span>
      {labelFor(VISIBILITIES, visibility)}
    </Badge>
  );
}
