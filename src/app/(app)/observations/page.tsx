import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ReliabilityBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { clsx } from "clsx";
import { RELIABILITIES, type Reliability } from "@/lib/constants";
import { personDisplayName } from "@/lib/format";

export default async function ObservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ reliability?: string }>;
}) {
  const { reliability } = await searchParams;

  const observations = await prisma.observation.findMany({
    where: { archived: false, ...(reliability ? { reliability } : {}) },
    include: { person: true, location: true, vehicle: true },
    orderBy: { occurredAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-foreground">Observations</h1>
          <p className="mt-1 text-sm text-muted">Ce que votre personnage a vu, entendu ou appris.</p>
        </div>
        <LinkButton href="/observations/nouveau" variant="primary">
          + Nouvelle observation
        </LinkButton>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/observations"
          className={clsx(
            "rounded-full border px-3 py-1 text-xs",
            !reliability ? "border-accent text-accent" : "border-border text-muted",
          )}
        >
          Toutes
        </Link>
        {RELIABILITIES.map((rel) => (
          <Link
            key={rel.value}
            href={`/observations?reliability=${rel.value}`}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs",
              reliability === rel.value ? "border-accent text-accent" : "border-border text-muted",
            )}
          >
            {rel.label}
          </Link>
        ))}
      </div>

      {observations.length === 0 ? (
        <EmptyState
          title="Aucune observation"
          description="Enregistrez votre premiere observation."
          actionHref="/observations/nouveau"
          actionLabel="Creer une observation"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {observations.map((observation) => (
            <Link key={observation.id} href={`/observations/${observation.id}`}>
              <Card className="p-4 transition-colors hover:border-accent/40">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-foreground">{observation.description}</p>
                  <ReliabilityBadge value={observation.reliability as Reliability} />
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                  <span>{observation.occurredAt.toLocaleString("fr-FR")}</span>
                  {observation.location ? <span>{observation.location.name}</span> : null}
                  {observation.person ? <span>{personDisplayName(observation.person)}</span> : null}
                  {observation.vehicle ? <span>{observation.vehicle.plate}</span> : null}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
