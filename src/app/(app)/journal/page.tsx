import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";

export default async function JournalPage() {
  const entries = await prisma.journalEntry.findMany({
    where: { archived: false },
    orderBy: { date: "desc" },
    include: { _count: { select: { peopleMet: true, tasksSpawned: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-foreground">Journal</h1>
          <p className="mt-1 text-sm text-muted">Journal prive de votre personnage.</p>
        </div>
        <LinkButton href="/journal/nouveau" variant="primary">
          + Nouvelle entree
        </LinkButton>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="Aucune entree"
          description="Ecrivez votre premiere entree de journal."
          actionHref="/journal/nouveau"
          actionLabel="Nouvelle entree"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/journal/${entry.id}`}>
              <Card className="p-4 transition-colors hover:border-accent/40">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-sm tracking-wide text-accent">
                    {entry.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  {entry.mood ? <span className="text-xs text-muted">{entry.mood}</span> : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-foreground">{entry.content}</p>
                <div className="mt-2 flex gap-3 text-xs text-muted">
                  <span>{entry._count.peopleMet} personne(s) rencontree(s)</span>
                  <span>{entry._count.tasksSpawned} tache(s)</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
