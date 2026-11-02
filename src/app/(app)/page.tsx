import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReliabilityBadge } from "@/components/ui/Badge";

export default async function DashboardPage() {
  const [
    personCount,
    contactCount,
    vehicleCount,
    organizationCount,
    locationCount,
    observationCount,
    recentPersons,
    toVerify,
    upcomingEvents,
    recentActivity,
  ] = await Promise.all([
    prisma.person.count({ where: { archived: false } }),
    prisma.person.count({ where: { archived: false, category: "CONTACT" } }),
    prisma.vehicle.count({ where: { archived: false } }),
    prisma.organization.count({ where: { archived: false } }),
    prisma.location.count({ where: { archived: false } }),
    prisma.observation.count({ where: { archived: false } }),
    prisma.person.findMany({
      where: { archived: false },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.observation.findMany({
      where: { archived: false, reliability: { in: ["UNVERIFIED", "CONTRADICTORY"] } },
      orderBy: { occurredAt: "desc" },
      take: 5,
      include: { person: true },
    }),
    prisma.event.findMany({
      where: { done: false, startAt: { gte: new Date() } },
      orderBy: { startAt: "asc" },
      take: 5,
    }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted">
          Vue d&apos;ensemble du carnet — usage personnel, hors-RP.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Personnes" value={personCount} href="/annuaire" />
        <StatTile label="Contacts" value={contactCount} href="/annuaire?category=CONTACT" />
        <StatTile label="Vehicules" value={vehicleCount} href="/vehicules" />
        <StatTile label="Organisations" value={organizationCount} href="/organisations" />
        <StatTile label="Lieux" value={locationCount} href="/lieux" />
        <StatTile label="Observations" value={observationCount} href="/observations" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Derniers dossiers modifies" />
          <CardBody className="p-0">
            {recentPersons.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="Aucun dossier"
                  description="Ajoutez votre premiere fiche dans l'annuaire."
                  actionHref="/annuaire/nouveau"
                  actionLabel="Creer une fiche"
                />
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {recentPersons.map((person) => (
                  <li key={person.id}>
                    <Link
                      href={`/annuaire/${person.id}`}
                      className="flex items-center justify-between px-5 py-3 text-sm hover:bg-panel-raised"
                    >
                      <span>
                        {person.firstName} {person.lastName ?? ""}
                        {person.nickname ? (
                          <span className="text-muted"> &laquo;{person.nickname}&raquo;</span>
                        ) : null}
                      </span>
                      <span className="text-xs text-muted">
                        {person.updatedAt.toLocaleDateString("fr-FR")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="A verifier" subtitle="Observations non confirmees ou contradictoires" />
          <CardBody className="p-0">
            {toVerify.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Rien a verifier pour le moment" />
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {toVerify.map((observation) => (
                  <li key={observation.id}>
                    <Link
                      href={`/observations/${observation.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-panel-raised"
                    >
                      <span className="truncate">{observation.description}</span>
                      <ReliabilityBadge value={observation.reliability as never} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Rappels" subtitle="Prochains rendez-vous et evenements" />
          <CardBody className="p-0">
            {upcomingEvents.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="Aucun rappel a venir"
                  actionHref="/agenda/nouveau"
                  actionLabel="Ajouter un rendez-vous"
                />
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {upcomingEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href="/agenda"
                      className="flex items-center justify-between px-5 py-3 text-sm hover:bg-panel-raised"
                    >
                      <span>{event.title}</span>
                      <span className="text-xs text-muted">
                        {event.startAt.toLocaleString("fr-FR")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Activite recente" />
          <CardBody className="p-0">
            {recentActivity.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Aucune activite enregistree" />
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {recentActivity.map((entry) => (
                  <li key={entry.id} className="px-5 py-3 text-sm text-muted">
                    <span className="text-foreground">{entry.action}</span> — {entry.entityType}
                    <span className="float-right text-xs">
                      {entry.createdAt.toLocaleString("fr-FR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
