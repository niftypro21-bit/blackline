import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { McMemberForm } from "@/components/forms/McMemberForm";
import { upsertMcMember } from "@/lib/actions/mc";
import { listPersonsForSelect } from "@/lib/actions/lookups";
import { personDisplayName } from "@/lib/format";

export default async function EditMcMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [person, persons] = await Promise.all([
    prisma.person.findUnique({ where: { id }, include: { mcMember: true } }),
    listPersonsForSelect(),
  ]);

  if (!person) notFound();

  const action = upsertMcMember.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted">Fiche MC (notes personnelles)</p>
        <h1 className="font-display text-2xl tracking-wide text-foreground">{personDisplayName(person)}</h1>
      </div>
      <McMemberForm
        action={action}
        mcMember={person.mcMember}
        persons={persons}
        personId={person.id}
        cancelHref={`/annuaire/${person.id}`}
      />
    </div>
  );
}
