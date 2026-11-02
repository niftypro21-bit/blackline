"use client";

import { useActionState } from "react";
import { updateDiscordWebhook, clearDiscordWebhook } from "@/lib/actions/settings-actions";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function WebhookForm({ configured }: { configured: boolean }) {
  const [error, formAction, pending] = useActionState(updateDiscordWebhook, undefined);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Statut :{" "}
        <span className={configured ? "text-accent" : "text-muted"}>
          {configured ? "Webhook configure" : "Aucun webhook configure"}
        </span>
        . L&apos;URL n&apos;est jamais renvoyee au navigateur une fois enregistree.
      </p>
      <form action={formAction} className="flex flex-col gap-4">
        <Field label="URL du webhook Discord" htmlFor="url">
          <Input id="url" name="url" type="url" placeholder="https://discord.com/api/webhooks/..." />
        </Field>
        {error ? <p className="text-sm text-status-refused">{error}</p> : null}
        <Button type="submit" variant="primary" disabled={pending} className="justify-center">
          {pending ? "..." : "Enregistrer"}
        </Button>
      </form>
      {configured ? (
        <form action={clearDiscordWebhook}>
          <Button type="submit" variant="ghost">
            Retirer le webhook
          </Button>
        </form>
      ) : null}
    </div>
  );
}
