import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/forms/EventForm";
import { updateEvent } from "@/lib/actions/events";
import { listPersonsForSelect, listLocationsForSelect } from "@/lib/actions/lookups";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, participants, persons, locations] = await Promise.all([
    prisma.event.findUnique({ where: { id } }),
    prisma.eventParticipant.findMany({ where: { eventId: id }, select: { personId: true } }),
    listPersonsForSelect(),
    listLocationsForSelect(),
  ]);

  if (!event) notFound();

  const action = updateEvent.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Modifier le rendez-vous</h1>
      </div>
      <EventForm
        action={action}
        event={event}
        participantIds={participants.map((p) => p.personId)}
        persons={persons}
        locations={locations}
        cancelHref="/agenda"
      />
    </div>
  );
}
