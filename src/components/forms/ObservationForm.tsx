import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { RELIABILITIES, VISIBILITIES } from "@/lib/constants";
import { personDisplayName, vehicleDisplayName } from "@/lib/format";
import type { Observation } from "@/generated/prisma/client";

function toDatetimeLocal(date?: Date | null) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ObservationForm({
  action,
  observation,
  witnessIds = [],
  persons,
  vehicles,
  locations,
  sources,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  observation?: Observation;
  witnessIds?: string[];
  persons: { id: string; firstName: string; lastName: string | null; nickname: string | null }[];
  vehicles: { id: string; make: string | null; model: string | null; plate: string | null }[];
  locations: { id: string; name: string }[];
  sources: { id: string; name: string }[];
  cancelHref: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date et heure" htmlFor="occurredAt">
          <Input
            id="occurredAt"
            name="occurredAt"
            type="datetime-local"
            defaultValue={toDatetimeLocal(observation?.occurredAt) || toDatetimeLocal(new Date())}
            required
          />
        </Field>
        <Field label="Lieu" htmlFor="locationId">
          <Select id="locationId" name="locationId" defaultValue={observation?.locationId ?? ""}>
            <option value="">Non precise</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Personne concernee" htmlFor="personId">
          <Select id="personId" name="personId" defaultValue={observation?.personId ?? ""}>
            <option value="">Aucune</option>
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {personDisplayName(person)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Vehicule" htmlFor="vehicleId">
          <Select id="vehicleId" name="vehicleId" defaultValue={observation?.vehicleId ?? ""}>
            <option value="">Aucun</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicleDisplayName(vehicle)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Source" htmlFor="sourceId">
          <Select id="sourceId" name="sourceId" defaultValue={observation?.sourceId ?? ""}>
            <option value="">Non precisee</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Preuve (URL)" htmlFor="evidenceUrl">
          <Input id="evidenceUrl" name="evidenceUrl" defaultValue={observation?.evidenceUrl ?? ""} />
        </Field>
        <Field label="Fiabilite" htmlFor="reliability">
          <Select id="reliability" name="reliability" defaultValue={observation?.reliability ?? "UNVERIFIED"}>
            {RELIABILITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Visibilite" htmlFor="visibility">
          <Select id="visibility" name="visibility" defaultValue={observation?.visibility ?? "PRIVATE"}>
            {VISIBILITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={observation?.description ?? ""} required />
      </Field>

      <Field label="Personnes presentes (temoins)" htmlFor="witnessIds">
        <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-panel-raised p-3">
          {persons.length === 0 ? (
            <p className="text-sm text-muted">Aucune personne dans l&apos;annuaire.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {persons.map((person) => (
                <label key={person.id} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="witnessIds"
                    value={person.id}
                    defaultChecked={witnessIds.includes(person.id)}
                    className="accent-accent"
                  />
                  {personDisplayName(person)}
                </label>
              ))}
            </div>
          )}
        </div>
      </Field>

      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={observation?.notes ?? ""} />
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
