import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { PERSON_CATEGORIES, labelFor, type PersonCategory } from "@/lib/constants";
import { clsx } from "clsx";

export default async function AnnuairePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const persons = await prisma.person.findMany({
    where: {
      archived: false,
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { nickname: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    include: { organization: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-foreground">Annuaire</h1>
          <p className="mt-1 text-sm text-muted">Personnes rencontrees en RP.</p>
        </div>
        <LinkButton href="/annuaire/nouveau" variant="primary">
          + Nouvelle fiche
        </LinkButton>
      </div>

      <form className="flex flex-wrap gap-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher un nom, surnom, telephone..."
          className="min-w-56 flex-1 rounded-md border border-border bg-panel-raised px-3 py-2 text-sm placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent"
        >
          Rechercher
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/annuaire"
          className={clsx(
            "rounded-full border px-3 py-1 text-xs",
            !category ? "border-accent text-accent" : "border-border text-muted",
          )}
        >
          Toutes
        </Link>
        {PERSON_CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/annuaire?category=${cat.value}`}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs",
              category === cat.value ? "border-accent text-accent" : "border-border text-muted",
            )}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {persons.length === 0 ? (
        <EmptyState
          title="Aucune fiche"
          description="Ajoutez une premiere personne a l'annuaire."
          actionHref="/annuaire/nouveau"
          actionLabel="Creer une fiche"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {persons.map((person) => (
            <Link key={person.id} href={`/annuaire/${person.id}`}>
              <Card className="h-full p-4 transition-colors hover:border-accent/40">
                <p className="text-foreground">
                  {person.firstName} {person.lastName ?? ""}
                </p>
                {person.nickname ? (
                  <p className="text-sm text-muted">&laquo;{person.nickname}&raquo;</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge>{labelFor(PERSON_CATEGORIES, person.category as PersonCategory)}</Badge>
                  {person.organization ? <Badge>{person.organization.name}</Badge> : null}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
