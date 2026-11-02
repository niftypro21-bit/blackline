import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge, VisibilityBadge, ReliabilityBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { DossierPanel } from "@/components/dossier/DossierPanel";
import { archiveFromForm } from "@/lib/actions/archive";
import { ORGANIZATION_TYPES, PERSON_CATEGORIES, labelFor, type OrganizationType, type PersonCategory, type Visibility, type Reliability } from "@/lib/constants";

export default async function OrganizationDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: { members: { where: { archived: false } } },
  });

  if (!organization) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Organisation</p>
          <h1 className="font-display text-2xl tracking-wide text-foreground">{organization.name}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge>{labelFor(ORGANIZATION_TYPES, organization.type as OrganizationType)}</Badge>
            {organization.trustLevel ? (
              <ReliabilityBadge value={organization.trustLevel as Reliability} />
            ) : null}
            <VisibilityBadge value={organization.visibility as Visibility} />
          </div>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/organisations/${organization.id}/modifier`}>Modifier</LinkButton>
          <form action={archiveFromForm}>
            <input type="hidden" name="entityType" value="ORGANIZATION" />
            <input type="hidden" name="entityId" value={organization.id} />
            <input type="hidden" name="redirectTo" value="/organisations" />
            <ConfirmButton confirmMessage="Archiver cette organisation ?">Archiver</ConfirmButton>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Description" />
            <CardBody>
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {organization.description || "Aucune description."}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Membres connus" />
            <CardBody className="p-0">
              {organization.members.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted">Aucun membre associe.</p>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {organization.members.map((member) => (
                    <li key={member.id}>
                      <Link
                        href={`/annuaire/${member.id}`}
                        className="flex items-center justify-between px-5 py-3 text-sm hover:bg-panel-raised"
                      >
                        <span>
                          {member.firstName} {member.lastName ?? ""}
                        </span>
                        <Badge>{labelFor(PERSON_CATEGORIES, member.category as PersonCategory)}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <DossierPanel entityType="ORGANIZATION" entityId={organization.id} />
      </div>
    </div>
  );
}
