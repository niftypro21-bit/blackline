"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions/auth-actions";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, formAction, pending] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/"} />
      <Field label="Pseudo" htmlFor="username">
        <Input id="username" name="username" type="text" required autoFocus autoComplete="username" />
      </Field>
      <Field label="Mot de passe" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </Field>
      {error ? <p className="text-sm text-status-refused">{error}</p> : null}
      <Button type="submit" variant="primary" disabled={pending} className="mt-2 justify-center">
        {pending ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
