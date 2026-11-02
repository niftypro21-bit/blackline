import { EventForm } from "@/components/forms/EventForm";
import { createEvent } from "@/lib/actions/events";
import { listPersonsForSelect, listLocationsForSelect } from "@/lib/actions/lookups";

export default async function NewEventPage() {
  const [persons, locations] = await Promise.all([listPersonsForSelect(), listLocationsForSelect()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Nouveau rendez-vous</h1>
      </div>
      <EventForm action={createEvent} persons={persons} locations={locations} cancelHref="/agenda" />
    </div>
  );
}
