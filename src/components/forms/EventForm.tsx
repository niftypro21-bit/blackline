import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { EVENT_CATEGORIES, VISIBILITIES } from "@/lib/constants";
import { personDisplayName } from "@/lib/format";
import type { Event } from "@/generated/prisma/client";

function toDatetimeLocal(date?: Date | null) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EventForm({
  action,
  event,
  participantIds = [],
  persons,
  locations,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  event?: Event;
  participantIds?: string[];
  persons: { id: string; firstName: string; lastName: string | null; nickname: string | null }[];
  locations: { id: string; name: string }[];
  cancelHref: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Titre" htmlFor="title" className="sm:col-span-2">
          <Input id="title" name="title" defaultValue={event?.title} required />
        </Field>
        <Field label="Type" htmlFor="category">
          <Select id="category" name="category" defaultValue={event?.category ?? "APPOINTMENT"}>
            {EVENT_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Lieu" htmlFor="locationId">
          <Select id="locationId" name="locationId" defaultValue={event?.locationId ?? ""}>
            <option value="">Non precise</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Debut" htmlFor="startAt">
          <Input
            id="startAt"
            name="startAt"
            type="datetime-local"
            defaultValue={toDatetimeLocal(event?.startAt) || toDatetimeLocal(new Date())}
            required
          />
        </Field>
        <Field label="Fin (optionnel)" htmlFor="endAt">
          <Input id="endAt" name="endAt" type="datetime-local" defaultValue={toDatetimeLocal(event?.endAt)} />
        </Field>
        <Field label="Visibilite" htmlFor="visibility">
          <Select id="visibility" name="visibility" defaultValue={event?.visibility ?? "PRIVATE"}>
            {VISIBILITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={event?.description ?? ""} />
      </Field>

      <Field label="Participants" htmlFor="participantIds">
        <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-panel-raised p-3">
          {persons.length === 0 ? (
            <p className="text-sm text-muted">Aucune personne dans l&apos;annuaire.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {persons.map((person) => (
                <label key={person.id} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="participantIds"
                    value={person.id}
                    defaultChecked={participantIds.includes(person.id)}
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
