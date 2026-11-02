import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PersonForm } from "@/components/forms/PersonForm";
import { updatePerson } from "@/lib/actions/persons";
import { listOrganizationsForSelect } from "@/lib/actions/lookups";

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [person, organizations] = await Promise.all([
    prisma.person.findUnique({ where: { id } }),
    listOrganizationsForSelect(),
  ]);

  if (!person) notFound();

  const action = updatePerson.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Modifier la fiche</h1>
        <p className="mt-1 text-sm text-muted">
          {person.firstName} {person.lastName ?? ""}
        </p>
      </div>
      <PersonForm
        action={action}
        person={person}
        organizations={organizations}
        cancelHref={`/annuaire/${person.id}`}
      />
    </div>
  );
}
