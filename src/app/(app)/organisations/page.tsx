import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { ORGANIZATION_TYPES, labelFor, type OrganizationType } from "@/lib/constants";

export default async function OrganizationsPage() {
  const organizations = await prisma.organization.findMany({
    where: { archived: false },
    include: { _count: { select: { members: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-foreground">Organisations</h1>
          <p className="mt-1 text-sm text-muted">Entreprises, groupes, gangs, MC, services publics.</p>
        </div>
        <LinkButton href="/organisations/nouveau" variant="primary">
          + Nouvelle organisation
        </LinkButton>
      </div>

      {organizations.length === 0 ? (
        <EmptyState
          title="Aucune organisation"
          description="Ajoutez une premiere organisation."
          actionHref="/organisations/nouveau"
          actionLabel="Creer une organisation"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Link key={org.id} href={`/organisations/${org.id}`}>
              <Card className="h-full p-4 transition-colors hover:border-accent/40">
                <p className="text-foreground">{org.name}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge>{labelFor(ORGANIZATION_TYPES, org.type as OrganizationType)}</Badge>
                  <Badge>{org._count.members} membre(s)</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
