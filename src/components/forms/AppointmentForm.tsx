"use client";

import { useActionState } from "react";
import { createAppointment } from "@/lib/actions/appointments";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function AppointmentForm({ groups }: { groups: { id: string; name: string }[] }) {
  const [error, formAction, pending] = useActionState(createAppointment, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Groupe" htmlFor="groupId">
        <Select id="groupId" name="groupId" required defaultValue="">
          <option value="" disabled>
            Choisir un groupe
          </option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Titre" htmlFor="title">
        <Input id="title" name="title" type="text" required />
      </Field>
      <Field label="Date et heure" htmlFor="scheduledAt">
        <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
      </Field>
      <Field label="Lieu" htmlFor="location">
        <Input id="location" name="location" type="text" />
      </Field>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" />
      </Field>
      {error ? <p className="text-sm text-status-refused">{error}</p> : null}
      <Button type="submit" variant="primary" disabled={pending} className="justify-center">
        {pending ? "..." : "Proposer le rendez-vous"}
      </Button>
    </form>
  );
}
