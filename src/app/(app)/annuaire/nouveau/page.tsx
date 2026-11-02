import { PersonForm } from "@/components/forms/PersonForm";
import { createPerson } from "@/lib/actions/persons";
import { listOrganizationsForSelect } from "@/lib/actions/lookups";

export default async function NewPersonPage() {
  const organizations = await listOrganizationsForSelect();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Nouvelle fiche</h1>
        <p className="mt-1 text-sm text-muted">Ajouter une personne a l&apos;annuaire.</p>
      </div>
      <PersonForm action={createPerson} organizations={organizations} cancelHref="/annuaire" />
    </div>
  );
}
