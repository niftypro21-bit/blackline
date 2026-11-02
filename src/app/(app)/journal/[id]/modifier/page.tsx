import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JournalEntryForm } from "@/components/forms/JournalEntryForm";
import { updateJournalEntry } from "@/lib/actions/journal";
import { listPersonsForSelect } from "@/lib/actions/lookups";

export default async function EditJournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [entry, peopleMet, persons] = await Promise.all([
    prisma.journalEntry.findUnique({ where: { id } }),
    prisma.journalEntryPerson.findMany({ where: { journalEntryId: id }, select: { personId: true } }),
    listPersonsForSelect(),
  ]);

  if (!entry) notFound();

  const action = updateJournalEntry.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Modifier l&apos;entree</h1>
      </div>
      <JournalEntryForm
        action={action}
        entry={entry}
        peopleMetIds={peopleMet.map((p) => p.personId)}
        persons={persons}
        cancelHref={`/journal/${entry.id}`}
      />
    </div>
  );
}
