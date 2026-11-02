import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";

export default async function LocationsPage() {
  const locations = await prisma.location.findMany({
    where: { archived: false },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-foreground">Lieux</h1>
          <p className="mt-1 text-sm text-muted">Lieux importants reperes en RP.</p>
        </div>
        <LinkButton href="/lieux/nouveau" variant="primary">
          + Nouveau lieu
        </LinkButton>
      </div>

      {locations.length === 0 ? (
        <EmptyState
          title="Aucun lieu"
          description="Ajoutez un premier lieu."
          actionHref="/lieux/nouveau"
          actionLabel="Creer un lieu"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <Link key={location.id} href={`/lieux/${location.id}`}>
              <Card className="h-full p-4 transition-colors hover:border-accent/40">
                <p className="text-foreground">{location.name}</p>
                {location.address ? <p className="mt-1 text-sm text-muted">{location.address}</p> : null}
                {location.category ? (
                  <div className="mt-3">
                    <Badge>{location.category}</Badge>
                  </div>
                ) : null}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
