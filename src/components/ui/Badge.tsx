import { clsx } from "clsx";
import { labelFor, ORDER_STATUSES, USER_ROLES, type OrderStatus, type UserRole } from "@/lib/constants";

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

const ORDER_STATUS_DOT: Record<OrderStatus, string> = {
  EN_ATTENTE: "bg-status-pending",
  APPROUVEE: "bg-status-approved",
  REFUSEE: "bg-status-refused",
};

export function OrderStatusBadge({ value }: { value: OrderStatus | string }) {
  const status = value as OrderStatus;
  return (
    <Badge>
      <span className={clsx("h-1.5 w-1.5 rounded-full", ORDER_STATUS_DOT[status] ?? "bg-muted")} />
      {labelFor(ORDER_STATUSES, status)}
    </Badge>
  );
}

export function RoleBadge({ value }: { value: UserRole | string }) {
  const role = value as UserRole;
  return <Badge tone={role === "OWNER" ? "accent" : "default"}>{labelFor(USER_ROLES, role)}</Badge>;
}

export function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex h-2 w-2 rounded-full",
        active ? "bg-status-approved" : "bg-status-refused",
      )}
      aria-hidden
    />
  );
}
