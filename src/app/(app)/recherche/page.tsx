import Link from "next/link";
import { globalSearch } from "@/lib/search";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const TYPE_LABEL: Record<string, string> = {
  PERSON: "Personne",
  VEHICLE: "Vehicule",
  ORGANIZATION: "Organisation",
  LOCATION: "Lieu",
  NOTE: "Note",
  TAG: "Tag",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = q ? await globalSearch(q) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Recherche</h1>
        <p className="mt-1 text-sm text-muted">
          Noms, surnoms, plaques, organisations, lieux, telephones, tags, notes.
        </p>
      </div>

      <form className="flex gap-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          autoFocus
          placeholder="Rechercher dans tout le carnet..."
          className="flex-1 rounded-md border border-border bg-panel-raised px-3 py-2 text-sm placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
        <button type="submit" className="rounded-md border border-accent/40 bg-accent-soft px-4 py-2 text-sm text-accent">
          Rechercher
        </button>
      </form>

      {!q ? (
        <p className="text-sm text-muted">Saisissez un terme pour lancer la recherche.</p>
      ) : results.length === 0 ? (
        <EmptyState title="Aucun resultat" description={`Rien ne correspond a « ${q} ».`} />
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((result) => (
            <Link key={`${result.type}-${result.id}`} href={result.href}>
              <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:border-accent/40">
                <span className="text-sm text-foreground">{result.label}</span>
                <div className="flex items-center gap-2">
                  {result.meta ? <span className="text-xs text-muted">{result.meta}</span> : null}
                  <Badge>{TYPE_LABEL[result.type] ?? result.type}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
