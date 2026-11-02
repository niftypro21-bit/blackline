import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge, VisibilityBadge, ReliabilityBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { DossierPanel } from "@/components/dossier/DossierPanel";
import { archiveFromForm } from "@/lib/actions/archive";
import type { Visibility, Reliability } from "@/lib/constants";

export default async function LocationDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      observations: { where: { archived: false }, orderBy: { occurredAt: "desc" }, take: 10 },
      events: { orderBy: { startAt: "desc" }, take: 5 },
    },
  });

  if (!location) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Lieu</p>
          <h1 className="font-display text-2xl tracking-wide text-foreground">{location.name}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {location.category ? <Badge>{location.category}</Badge> : null}
            <VisibilityBadge value={location.visibility as Visibility} />
          </div>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/lieux/${location.id}/modifier`}>Modifier</LinkButton>
          <form action={archiveFromForm}>
            <input type="hidden" name="entityType" value="LOCATION" />
            <input type="hidden" name="entityId" value={location.id} />
            <input type="hidden" name="redirectTo" value="/lieux" />
            <ConfirmButton confirmMessage="Archiver ce lieu ?">Archiver</ConfirmButton>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Fiche" />
            <CardBody className="grid gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Adresse RP</p>
                <p className="mt-1 text-sm text-foreground">{location.address || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {location.description || "Aucune description."}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Observations sur place" />
            <CardBody className="p-0">
              {location.observations.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">Aucune observation enregistree.</p>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {location.observations.map((observation) => (
                    <li key={observation.id}>
                      <Link
                        href={`/observations/${observation.id}`}
                        className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-panel-raised"
                      >
                        <span className="truncate">{observation.description}</span>
                        <ReliabilityBadge value={observation.reliability as Reliability} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Evenements a cet endroit" />
            <CardBody className="p-0">
              {location.events.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">Aucun evenement lie.</p>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {location.events.map((event) => (
                    <li key={event.id} className="flex items-center justify-between px-5 py-3 text-sm">
                      <span>{event.title}</span>
                      <span className="text-xs text-muted">{event.startAt.toLocaleString("fr-FR")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <DossierPanel entityType="LOCATION" entityId={location.id} />
      </div>
    </div>
  );
}
