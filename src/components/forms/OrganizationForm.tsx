import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { ORGANIZATION_TYPES, RELIABILITIES, VISIBILITIES } from "@/lib/constants";
import type { Organization } from "@/generated/prisma/client";

export function OrganizationForm({
  action,
  organization,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  organization?: Organization;
  cancelHref: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" htmlFor="name">
          <Input id="name" name="name" defaultValue={organization?.name} required />
        </Field>
        <Field label="Type" htmlFor="type">
          <Select id="type" name="type" defaultValue={organization?.type ?? "OTHER"}>
            {ORGANIZATION_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Niveau de confiance" htmlFor="trustLevel">
          <Select id="trustLevel" name="trustLevel" defaultValue={organization?.trustLevel ?? ""}>
            <option value="">Non precise</option>
            {RELIABILITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Visibilite" htmlFor="visibility">
          <Select id="visibility" name="visibility" defaultValue={organization?.visibility ?? "PRIVATE"}>
            {VISIBILITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Description / notes" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={organization?.description ?? ""} />
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
