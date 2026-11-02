import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrganizationForm } from "@/components/forms/OrganizationForm";
import { updateOrganization } from "@/lib/actions/organizations";

export default async function EditOrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await prisma.organization.findUnique({ where: { id } });
  if (!organization) notFound();

  const action = updateOrganization.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Modifier l&apos;organisation</h1>
        <p className="mt-1 text-sm text-muted">{organization.name}</p>
      </div>
      <OrganizationForm action={action} organization={organization} cancelHref={`/organisations/${organization.id}`} />
    </div>
  );
}
