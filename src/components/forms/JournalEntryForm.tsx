import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { personDisplayName } from "@/lib/format";
import type { JournalEntry } from "@/generated/prisma/client";

function toDateInput(date?: Date | null) {
  if (!date) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function JournalEntryForm({
  action,
  entry,
  peopleMetIds = [],
  persons,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  entry?: JournalEntry;
  peopleMetIds?: string[];
  persons: { id: string; firstName: string; lastName: string | null; nickname: string | null }[];
  cancelHref: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" htmlFor="date">
          <Input id="date" name="date" type="date" defaultValue={toDateInput(entry?.date)} required />
        </Field>
        <Field label="Humeur (optionnel)" htmlFor="mood">
          <Input id="mood" name="mood" defaultValue={entry?.mood ?? ""} placeholder="tendu, confiant, mefiant..." />
        </Field>
      </div>

      <Field label="Evenements de la journee" htmlFor="content">
        <Textarea id="content" name="content" defaultValue={entry?.content ?? ""} required className="min-h-32" />
      </Field>

      <Field label="Choses apprises" htmlFor="thingsLearned">
        <Textarea id="thingsLearned" name="thingsLearned" defaultValue={entry?.thingsLearned ?? ""} />
      </Field>

      <Field label="Choses a verifier" htmlFor="thingsToVerify">
        <Textarea id="thingsToVerify" name="thingsToVerify" defaultValue={entry?.thingsToVerify ?? ""} />
      </Field>

      <Field label="Choses a faire (une par ligne)" htmlFor="thingsToDo">
        <Textarea id="thingsToDo" name="thingsToDo" placeholder="Verifier la plaque MC-1138&#10;Recontacter Marcus" />
      </Field>

      <Field label="Personnes rencontrees" htmlFor="peopleMetIds">
        <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-panel-raised p-3">
          {persons.length === 0 ? (
            <p className="text-sm text-muted">Aucune personne dans l&apos;annuaire.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {persons.map((person) => (
                <label key={person.id} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="peopleMetIds"
                    value={person.id}
                    defaultChecked={peopleMetIds.includes(person.id)}
                    className="accent-accent"
                  />
                  {personDisplayName(person)}
                </label>
              ))}
            </div>
          )}
        </div>
      </Field>

      <div className="flex justify-end gap-3">
        <LinkButton href={cancelHref}>Annuler</LinkButton>
        <Button type="submit" variant="primary">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
