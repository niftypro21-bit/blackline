"use client";

import { useActionState } from "react";
import { createOwnerAccount } from "@/lib/actions/setup-actions";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function SetupForm() {
  const [error, formAction, pending] = useActionState(createOwnerAccount, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Pseudo" htmlFor="username">
        <Input id="username" name="username" type="text" required autoFocus autoComplete="username" />
      </Field>
      <Field label="Mot de passe" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>
      {error ? <p className="text-sm text-status-refused">{error}</p> : null}
      <Button type="submit" variant="primary" disabled={pending} className="mt-2 justify-center">
        {pending ? "Creation..." : "Creer le compte proprietaire"}
      </Button>
    </form>
  );
}
