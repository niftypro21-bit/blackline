"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { RoleBadge, StatusDot } from "@/components/ui/Badge";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { USER_ROLES } from "@/lib/constants";

export function AccountRow({
  user,
  onRoleChange,
  onActiveToggle,
  onAccountingToggle,
}: {
  user: { id: string; name: string; username: string; role: string; isActive: boolean; canAccessAccounting: boolean };
  onRoleChange: (userId: string, role: string) => Promise<void>;
  onActiveToggle: (userId: string, isActive: boolean) => Promise<void>;
  onAccountingToggle: (userId: string, canAccessAccounting: boolean) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const assignableRoles = USER_ROLES.filter((r) => r.value !== "OWNER");
  const isOwnerRow = user.role === "OWNER";

  return (
    <li className="flex flex-col gap-3 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusDot active={user.isActive} />
          <div>
            <p className="text-sm text-foreground">@{user.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwnerRow ? (
            <RoleBadge value={user.role} />
          ) : (
            <Select
              value={user.role}
              disabled={pending}
              onChange={(event) =>
                startTransition(() => onRoleChange(user.id, (event.target as HTMLSelectElement).value))
              }
              className="w-auto"
            >
              {assignableRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>
          )}

          {!isOwnerRow ? (
            <label className="flex items-center gap-1.5 text-xs text-muted">
              <input
                type="checkbox"
                checked={user.canAccessAccounting}
                disabled={pending}
                onChange={(event) =>
                  startTransition(() => onAccountingToggle(user.id, event.target.checked))
                }
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Comptabilite
            </label>
          ) : null}

          {!isOwnerRow ? (
            <Button
              type="button"
              variant={user.isActive ? "danger" : "primary"}
              disabled={pending}
              onClick={() => startTransition(() => onActiveToggle(user.id, !user.isActive))}
            >
              {user.isActive ? "Desactiver" : "Reactiver"}
            </Button>
          ) : null}
        </div>
      </div>

      {!isOwnerRow ? <ResetPasswordForm userId={user.id} /> : null}
    </li>
  );
}
