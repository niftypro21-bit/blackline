import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge, ReliabilityBadge, VisibilityBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { DossierPanel } from "@/components/dossier/DossierPanel";
import { archiveFromForm } from "@/lib/actions/archive";
import {
  PERSON_CATEGORIES,
  labelFor,
  type PersonCategory,
  type Reliability,
  type Visibility,
} from "@/lib/constants";

export default async function PersonDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      organization: true,
      mcMember: true,
      vehiclesOwned: { where: { archived: false } },
      observations: { where: { archived: false }, orderBy: { occurredAt: "desc" }, take: 10 },
      eventParticipants: { include: { event: true }, orderBy: { event: { startAt: "desc" } }, take: 5 },
    },
  });

  if (!person) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Dossier</p>
          <h1 className="font-display text-2xl tracking-wide text-foreground">
            {person.firstName} {person.lastName ?? ""}
            {person.nickname ? <span className="text-muted"> &laquo;{person.nickname}&raquo;</span> : null}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge>{labelFor(PERSON_CATEGORIES, person.category as PersonCategory)}</Badge>
            {person.reliability ? <ReliabilityBadge value={person.reliability as Reliability} /> : null}
            <VisibilityBadge value={person.visibility as Visibility} />
          </div>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/annuaire/${person.id}/modifier`}>Modifier</LinkButton>
          <form action={archiveFromForm}>
            <input type="hidden" name="entityType" value="PERSON" />
            <input type="hidden" name="entityId" value={person.id} />
            <input type="hidden" name="redirectTo" value="/annuaire" />
            <ConfirmButton confirmMessage="Archiver cette fiche ?">Archiver</ConfirmButton>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Fiche" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Info label="Profession" value={person.profession} />
              <Info label="Telephone RP" value={person.phone} />
              <Info
                label="Organisation"
                value={
                  person.organization ? (
                    <Link href={`/organisations/${person.organization.id}`} className="text-accent hover:underline">
                      {person.organization.name}
                    </Link>
                  ) : null
                }
              />
              <Info label="Statut" value={person.statusNote} />
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wider text-muted">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {person.description || "Aucune description."}
                </p>
              </div>
            </CardBody>
          </Card>

          {person.mcMember ? (
            <Card>
              <CardHeader
                title="Dossier MC"
                subtitle="Notes personnelles — pas un statut officiel"
                action={
                  <Link href={`/mc/membres/${person.id}`} className="text-xs text-accent hover:underline">
                    Modifier
                  </Link>
                }
              />
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <Info label="Grade" value={person.mcMember.grade} />
                <Info
                  label="Date d'entree"
                  value={person.mcMember.joinDate?.toLocaleDateString("fr-FR")}
                />
                <Info label="Statut patch" value={person.mcMember.patchStatus} />
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-muted">Notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                    {person.mcMember.notes || "Aucune note."}
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : person.category === "MC_MEMBER" || person.category === "PROSPECT" ? (
            <Card>
              <CardHeader title="Dossier MC" subtitle="Notes personnelles — pas un statut officiel" />
              <CardBody>
                <Link href={`/mc/membres/${person.id}`} className="text-sm text-accent hover:underline">
                  + Ajouter des informations MC (grade, parrain, notes...)
                </Link>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Vehicules associes" />
            <CardBody className="p-0">
              {person.vehiclesOwned.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">Aucun vehicule associe.</p>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {person.vehiclesOwned.map((vehicle) => (
                    <li key={vehicle.id}>
                      <Link
                        href={`/vehicules/${vehicle.id}`}
                        className="flex items-center justify-between px-5 py-3 text-sm hover:bg-panel-raised"
                      >
                        <span>
                          {[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Vehicule"}
                        </span>
                        <span className="text-xs text-muted">{vehicle.plate}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Observations" />
            <CardBody className="p-0">
              {person.observations.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">Aucune observation enregistree.</p>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {person.observations.map((observation) => (
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
            <CardHeader title="Evenements" />
            <CardBody className="p-0">
              {person.eventParticipants.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">Aucun evenement lie.</p>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {person.eventParticipants.map((participation) => (
                    <li key={participation.id} className="flex items-center justify-between px-5 py-3 text-sm">
                      <span>{participation.event.title}</span>
                      <span className="text-xs text-muted">
                        {participation.event.startAt.toLocaleString("fr-FR")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <DossierPanel entityType="PERSON" entityId={person.id} />
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
