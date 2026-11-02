import Link from "next/link";
import { requireSession } from "@/lib/session";
import { listAccessibleGroups } from "@/lib/access";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function GroupesPage() {
  const session = await requireSession();
  const groups = await listAccessibleGroups(session.user.id, session.user.role);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Groupes</h1>
        <p className="mt-1 text-sm text-muted">Votre espace par groupe — salons et rendez-vous reunis.</p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="Aucun groupe accessible"
          description="Demandez au proprietaire de vous donner acces a un groupe."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <Link key={group.id} href={`/groupes/${group.id}`}>
              <Card className="h-full transition-colors hover:border-accent/40">
                <CardHeader title={group.name} subtitle={group.description} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
