"use client";

import { useActionState } from "react";
import { createOwnerAccount } from "@/lib/actions/setup-actions";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function SetupForm() {
  const [error, formAction, pending] = useActionState(createOwnerAccount, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Nom" htmlFor="name">
        <Input id="name" name="name" type="text" required autoFocus autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" />
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
