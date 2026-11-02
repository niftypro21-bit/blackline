"use client";

import { useActionState } from "react";
import { resetAccountPassword } from "@/lib/actions/accounts";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [error, formAction, pending] = useActionState(resetAccountPassword, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-end gap-2">
        <Field label="Nouveau mot de passe" htmlFor={`password-${userId}`} className="flex-1">
          <Input
            id={`password-${userId}`}
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="8 caracteres minimum"
          />
        </Field>
        <Button type="submit" variant="ghost" disabled={pending}>
          {pending ? "..." : "Reinitialiser"}
        </Button>
      </div>
      {error ? <p className="text-xs text-status-refused">{error}</p> : null}
    </form>
  );
}
