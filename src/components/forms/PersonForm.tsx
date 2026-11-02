import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { PERSON_CATEGORIES, RELIABILITIES, VISIBILITIES } from "@/lib/constants";
import type { Person } from "@/generated/prisma/client";

export function PersonForm({
  action,
  person,
  organizations,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  person?: Person;
  organizations: { id: string; name: string }[];
  cancelHref: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prenom" htmlFor="firstName">
          <Input id="firstName" name="firstName" defaultValue={person?.firstName} required />
        </Field>
        <Field label="Nom" htmlFor="lastName">
          <Input id="lastName" name="lastName" defaultValue={person?.lastName ?? ""} />
        </Field>
        <Field label="Surnom" htmlFor="nickname">
          <Input id="nickname" name="nickname" defaultValue={person?.nickname ?? ""} />
        </Field>
        <Field label="Photo (URL)" htmlFor="photoUrl">
          <Input id="photoUrl" name="photoUrl" defaultValue={person?.photoUrl ?? ""} />
        </Field>
        <Field label="Profession" htmlFor="profession">
          <Input id="profession" name="profession" defaultValue={person?.profession ?? ""} />
        </Field>
        <Field label="Telephone RP" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={person?.phone ?? ""} />
        </Field>
        <Field label="Categorie" htmlFor="category">
          <Select id="category" name="category" defaultValue={person?.category ?? "CIVIL"}>
            {PERSON_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Organisation" htmlFor="organizationId">
          <Select id="organizationId" name="organizationId" defaultValue={person?.organizationId ?? ""}>
            <option value="">Aucune</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Statut" htmlFor="statusNote">
          <Input
            id="statusNote"
            name="statusNote"
            defaultValue={person?.statusNote ?? ""}
            placeholder="actif, recherche, disparu..."
          />
        </Field>
        <Field label="Fiabilite de la fiche" htmlFor="reliability">
          <Select id="reliability" name="reliability" defaultValue={person?.reliability ?? ""}>
            <option value="">Non precise</option>
            {RELIABILITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Visibilite" htmlFor="visibility">
          <Select id="visibility" name="visibility" defaultValue={person?.visibility ?? "PRIVATE"}>
            {VISIBILITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Description / notes generales" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={person?.description ?? ""} />
      </Field>

      <div className="flex justify-end gap-3">
        <LinkButton href={cancelHref}>Annuler</LinkButton>
        <Button type="submit" variant="primary">
          Enregistrer la fiche
        </Button>
      </div>
    </form>
  );
}
