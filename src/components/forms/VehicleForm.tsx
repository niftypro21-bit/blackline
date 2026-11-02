import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { VISIBILITIES } from "@/lib/constants";
import { personDisplayName } from "@/lib/format";
import type { Vehicle } from "@/generated/prisma/client";

export function VehicleForm({
  action,
  vehicle,
  persons,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  vehicle?: Vehicle;
  persons: { id: string; firstName: string; lastName: string | null; nickname: string | null }[];
  cancelHref: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Marque" htmlFor="make">
          <Input id="make" name="make" defaultValue={vehicle?.make ?? ""} />
        </Field>
        <Field label="Modele" htmlFor="model">
          <Input id="model" name="model" defaultValue={vehicle?.model ?? ""} />
        </Field>
        <Field label="Couleur" htmlFor="color">
          <Input id="color" name="color" defaultValue={vehicle?.color ?? ""} />
        </Field>
        <Field label="Plaque" htmlFor="plate">
          <Input id="plate" name="plate" defaultValue={vehicle?.plate ?? ""} />
        </Field>
        <Field label="Proprietaire connu" htmlFor="ownerPersonId">
          <Select id="ownerPersonId" name="ownerPersonId" defaultValue={vehicle?.ownerPersonId ?? ""}>
            <option value="">Inconnu</option>
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {personDisplayName(person)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Proprietaire suppose (si non lie)" htmlFor="ownerNote">
          <Input id="ownerNote" name="ownerNote" defaultValue={vehicle?.ownerNote ?? ""} />
        </Field>
        <Field label="Photo (URL)" htmlFor="photoUrl">
          <Input id="photoUrl" name="photoUrl" defaultValue={vehicle?.photoUrl ?? ""} />
        </Field>
        <Field label="Visibilite" htmlFor="visibility">
          <Select id="visibility" name="visibility" defaultValue={vehicle?.visibility ?? "PRIVATE"}>
            {VISIBILITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Description / notes" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={vehicle?.description ?? ""} />
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
