import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { VisibilityBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { DossierPanel } from "@/components/dossier/DossierPanel";
import { archiveFromForm } from "@/lib/actions/archive";
import { personDisplayName } from "@/lib/format";
import type { Visibility } from "@/lib/constants";

export default async function VehicleDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      ownerPerson: true,
      observations: { where: { archived: false }, orderBy: { occurredAt: "desc" }, take: 10, include: { location: true } },
    },
  });

  if (!vehicle) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Vehicule</p>
          <h1 className="font-display text-2xl tracking-wide text-foreground">
            {[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Vehicule"}
          </h1>
          <p className="mt-1 font-display text-lg tracking-widest text-accent">
            {vehicle.plate || "Plaque inconnue"}
          </p>
          <div className="mt-2">
            <VisibilityBadge value={vehicle.visibility as Visibility} />
          </div>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/vehicules/${vehicle.id}/modifier`}>Modifier</LinkButton>
          <form action={archiveFromForm}>
            <input type="hidden" name="entityType" value="VEHICLE" />
            <input type="hidden" name="entityId" value={vehicle.id} />
            <input type="hidden" name="redirectTo" value="/vehicules" />
            <ConfirmButton confirmMessage="Archiver ce vehicule ?">Archiver</ConfirmButton>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Fiche" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Info label="Couleur" value={vehicle.color} />
              <Info
                label="Proprietaire connu"
                value={
                  vehicle.ownerPerson ? (
                    <Link href={`/annuaire/${vehicle.ownerPerson.id}`} className="text-accent hover:underline">
                      {personDisplayName(vehicle.ownerPerson)}
                    </Link>
                  ) : (
                    vehicle.ownerNote
                  )
                }
              />
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wider text-muted">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {vehicle.description || "Aucune description."}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Lieux ou vu / Observations" />
            <CardBody className="p-0">
              {vehicle.observations.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">Aucune observation enregistree.</p>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {vehicle.observations.map((observation) => (
                    <li key={observation.id}>
                      <Link
                        href={`/observations/${observation.id}`}
                        className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-panel-raised"
                      >
                        <span className="truncate">{observation.description}</span>
                        <span className="text-xs text-muted">{observation.location?.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <DossierPanel entityType="VEHICLE" entityId={vehicle.id} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value || <span className="text-muted">-</span>}</p>
    </div>
  );
}
