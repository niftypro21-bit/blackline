import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { toggleEventDone, deleteEvent } from "@/lib/actions/events";
import { EVENT_CATEGORIES, labelFor, type EventCategory } from "@/lib/constants";

export default async function AgendaPage() {
  const events = await prisma.event.findMany({
    orderBy: { startAt: "asc" },
    include: { location: true, participants: { include: { person: true } } },
  });

  const now = new Date();
  const upcoming = events.filter((e) => !e.done && e.startAt >= now);
  const past = events.filter((e) => e.done || e.startAt < now);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-foreground">Agenda</h1>
          <p className="mt-1 text-sm text-muted">Rendez-vous, reunions et rappels RP.</p>
        </div>
        <LinkButton href="/agenda/nouveau" variant="primary">
          + Nouveau rendez-vous
        </LinkButton>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm uppercase tracking-wider text-muted">A venir</h2>
        {upcoming.length === 0 ? (
          <EmptyState title="Aucun evenement a venir" actionHref="/agenda/nouveau" actionLabel="Ajouter" />
        ) : (
          upcoming.map((event) => <EventRow key={event.id} event={event} />)
        )}
      </section>

      {past.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-sm uppercase tracking-wider text-muted">Passes</h2>
          {past.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

function EventRow({
  event,
}: {
  event: {
    id: string;
    title: string;
    category: string;
    startAt: Date;
    done: boolean;
    description: string | null;
    location: { name: string } | null;
    participants: { person: { firstName: string; lastName: string | null } }[];
  };
}) {
  return (
    <Card className="flex items-start justify-between gap-4 p-4">
      <div className="flex items-start gap-3">
        <form action={toggleEventDone}>
          <input type="hidden" name="id" value={event.id} />
          <input type="hidden" name="done" value={String(event.done)} />
          <button type="submit" title={event.done ? "Marquer non fait" : "Marquer fait"}>
            <span
              className={
                event.done
                  ? "block h-4 w-4 rounded-sm border border-accent bg-accent"
                  : "block h-4 w-4 rounded-sm border border-border"
              }
            />
          </button>
        </form>
        <div>
          <p className={event.done ? "text-sm text-muted line-through" : "text-sm text-foreground"}>
            {event.title}
          </p>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
            <span>{event.startAt.toLocaleString("fr-FR")}</span>
            <Badge>{labelFor(EVENT_CATEGORIES, event.category as EventCategory)}</Badge>
            {event.location ? <span>{event.location.name}</span> : null}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/agenda/${event.id}/modifier`}
          className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-foreground"
        >
          Modifier
        </Link>
        <form action={deleteEvent}>
          <input type="hidden" name="id" value={event.id} />
          <ConfirmButton confirmMessage="Supprimer cet evenement ?">&times;</ConfirmButton>
        </form>
      </div>
    </Card>
  );
}
