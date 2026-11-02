import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ReliabilityBadge, VisibilityBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { DossierPanel } from "@/components/dossier/DossierPanel";
import { archiveFromForm } from "@/lib/actions/archive";
import { personDisplayName, vehicleDisplayName } from "@/lib/format";
import type { Reliability, Visibility } from "@/lib/constants";

export default async function ObservationDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const observation = await prisma.observation.findUnique({
    where: { id },
    include: {
      person: true,
      vehicle: true,
      location: true,
      sourceRef: true,
      witnesses: { include: { person: true } },
    },
  });

  if (!observation) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Observation</p>
          <h1 className="font-display text-xl tracking-wide text-foreground">
            {observation.occurredAt.toLocaleString("fr-FR")}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <ReliabilityBadge value={observation.reliability as Reliability} />
            <VisibilityBadge value={observation.visibility as Visibility} />
          </div>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/observations/${observation.id}/modifier`}>Modifier</LinkButton>
          <form action={archiveFromForm}>
            <input type="hidden" name="entityType" value="OBSERVATION" />
            <input type="hidden" name="entityId" value={observation.id} />
            <input type="hidden" name="redirectTo" value="/observations" />
            <ConfirmButton confirmMessage="Archiver cette observation ?">Archiver</ConfirmButton>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Description" />
            <CardBody>
              <p className="whitespace-pre-wrap text-sm text-foreground">{observation.description}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Contexte" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Info
                label="Lieu"
                value={
                  observation.location ? (
                    <Link href={`/lieux/${observation.location.id}`} className="text-accent hover:underline">
                      {observation.location.name}
                    </Link>
                  ) : null
                }
              />
              <Info
                label="Personne concernee"
                value={
                  observation.person ? (
                    <Link href={`/annuaire/${observation.person.id}`} className="text-accent hover:underline">
                      {personDisplayName(observation.person)}
                    </Link>
                  ) : null
                }
              />
              <Info
                label="Vehicule"
                value={
                  observation.vehicle ? (
                    <Link href={`/vehicules/${observation.vehicle.id}`} className="text-accent hover:underline">
                      {vehicleDisplayName(observation.vehicle)}
                    </Link>
                  ) : null
                }
              />
              <Info label="Source" value={observation.sourceRef?.name} />
              <Info
                label="Preuve"
                value={
                  observation.evidenceUrl ? (
                    <a href={observation.evidenceUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      Voir la preuve
                    </a>
                  ) : null
                }
              />
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wider text-muted">Notes</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {observation.notes || "Aucune note complementaire."}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Personnes presentes" />
            <CardBody className="p-0">
              {observation.witnesses.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">Aucun temoin enregistre.</p>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {observation.witnesses.map((witness) => (
                    <li key={witness.id}>
                      <Link
                        href={`/annuaire/${witness.person.id}`}
                        className="block px-5 py-3 text-sm hover:bg-panel-raised"
                      >
                        {personDisplayName(witness.person)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <DossierPanel entityType="OBSERVATION" entityId={observation.id} />
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
