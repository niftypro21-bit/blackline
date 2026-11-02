"use client";

import { useActionState } from "react";
import { createAccount } from "@/lib/actions/accounts";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { USER_ROLES } from "@/lib/constants";

export function AccountForm() {
  const [error, formAction, pending] = useActionState(createAccount, undefined);
  const assignableRoles = USER_ROLES.filter((r) => r.value !== "OWNER");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Pseudo" htmlFor="username">
        <Input id="username" name="username" type="text" required />
      </Field>
      <Field label="Mot de passe initial" htmlFor="password">
        <Input id="password" name="password" type="password" required minLength={8} />
      </Field>
      <Field label="Role" htmlFor="role">
        <Select id="role" name="role" defaultValue="MEMBRE">
          {assignableRoles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </Select>
      </Field>
      {error ? <p className="text-sm text-status-refused">{error}</p> : null}
      <Button type="submit" variant="primary" disabled={pending} className="justify-center">
        {pending ? "Creation..." : "Creer le compte"}
      </Button>
    </form>
  );
}
