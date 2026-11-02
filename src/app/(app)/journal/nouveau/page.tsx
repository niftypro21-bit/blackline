import { JournalEntryForm } from "@/components/forms/JournalEntryForm";
import { createJournalEntry } from "@/lib/actions/journal";
import { listPersonsForSelect } from "@/lib/actions/lookups";

export default async function NewJournalEntryPage() {
  const persons = await listPersonsForSelect();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Nouvelle entree</h1>
        <p className="mt-1 text-sm text-muted">Journal prive — hors-RP pour l&apos;instant.</p>
      </div>
      <JournalEntryForm action={createJournalEntry} persons={persons} cancelHref="/journal" />
    </div>
  );
}
