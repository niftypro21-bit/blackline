import { OrganizationForm } from "@/components/forms/OrganizationForm";
import { createOrganization } from "@/lib/actions/organizations";

export default function NewOrganizationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Nouvelle organisation</h1>
        <p className="mt-1 text-sm text-muted">Entreprise, groupe, gang, MC ou service public.</p>
      </div>
      <OrganizationForm action={createOrganization} cancelHref="/organisations" />
    </div>
  );
}
