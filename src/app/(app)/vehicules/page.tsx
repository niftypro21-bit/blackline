import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { personDisplayName } from "@/lib/format";

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const vehicles = await prisma.vehicle.findMany({
    where: {
      archived: false,
      ...(q
        ? {
            OR: [
              { plate: { contains: q } },
              { make: { contains: q } },
              { model: { contains: q } },
            ],
          }
        : {}),
    },
    include: { ownerPerson: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-foreground">Vehicules</h1>
          <p className="mt-1 text-sm text-muted">Vehicules et plaques reperes en RP.</p>
        </div>
        <LinkButton href="/vehicules/nouveau" variant="primary">
          + Nouveau vehicule
        </LinkButton>
      </div>

      <form className="flex flex-wrap gap-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher une plaque, marque, modele..."
          className="min-w-56 flex-1 rounded-md border border-border bg-panel-raised px-3 py-2 text-sm placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
        <button type="submit" className="rounded-md border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent">
          Rechercher
        </button>
      </form>

      {vehicles.length === 0 ? (
        <EmptyState
          title="Aucun vehicule"
          description="Ajoutez un premier vehicule."
          actionHref="/vehicules/nouveau"
          actionLabel="Creer un vehicule"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Link key={vehicle.id} href={`/vehicules/${vehicle.id}`}>
              <Card className="h-full p-4 transition-colors hover:border-accent/40">
                <p className="text-foreground">
                  {[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Vehicule"}
                </p>
                <p className="mt-1 font-display text-sm tracking-wider text-accent">
                  {vehicle.plate || "Plaque inconnue"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {vehicle.color ? <Badge>{vehicle.color}</Badge> : null}
                  {vehicle.ownerPerson ? (
                    <Badge>{personDisplayName(vehicle.ownerPerson)}</Badge>
                  ) : vehicle.ownerNote ? (
                    <Badge>{vehicle.ownerNote}</Badge>
                  ) : null}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
