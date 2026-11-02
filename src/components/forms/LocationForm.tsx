import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { VISIBILITIES } from "@/lib/constants";
import type { Location } from "@/generated/prisma/client";

export function LocationForm({
  action,
  location,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  location?: Location;
  cancelHref: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" htmlFor="name">
          <Input id="name" name="name" defaultValue={location?.name} required />
        </Field>
        <Field label="Categorie" htmlFor="category">
          <Input
            id="category"
            name="category"
            defaultValue={location?.category ?? ""}
            placeholder="bar, garage, planque, entreprise..."
          />
        </Field>
        <Field label="Adresse RP" htmlFor="address" className="sm:col-span-2">
          <Input id="address" name="address" defaultValue={location?.address ?? ""} />
        </Field>
        <Field label="Latitude (optionnel)" htmlFor="lat">
          <Input id="lat" name="lat" type="number" step="any" defaultValue={location?.lat ?? ""} />
        </Field>
        <Field label="Longitude (optionnel)" htmlFor="lng">
          <Input id="lng" name="lng" type="number" step="any" defaultValue={location?.lng ?? ""} />
        </Field>
        <Field label="Visibilite" htmlFor="visibility">
          <Select id="visibility" name="visibility" defaultValue={location?.visibility ?? "PRIVATE"}>
            {VISIBILITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Description / notes" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={location?.description ?? ""} />
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
