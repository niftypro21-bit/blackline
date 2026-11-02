import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { personDisplayName } from "@/lib/format";

export default async function McPage() {
  const members = await prisma.person.findMany({
    where: {
      archived: false,
      OR: [{ category: { in: ["MC_MEMBER", "PROSPECT"] } }, { mcMember: { isNot: null } }],
    },
    include: { mcMember: true },
    orderBy: { firstName: "asc" },
  });

  const events = await prisma.event.findMany({
    where: { category: "MEETING" },
    orderBy: { startAt: "desc" },
    take: 10,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">MC</h1>
        <p className="mt-1 text-sm text-muted">
          Notes personnelles sur le club. Ceci n&apos;est pas un outil officiel du MC — uniquement vos
          propres observations et souvenirs.
        </p>
      </div>

      <Card>
        <CardHeader title="Membres et prospects" />
        <CardBody className="p-0">
          {members.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Aucun membre repertorie"
                description="Ajoutez une fiche a l'annuaire avec la categorie Membre MC ou Prospect."
                actionHref="/annuaire/nouveau"
                actionLabel="Ajouter une fiche"
              />
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {members.map((member) => (
                <li key={member.id}>
                  <Link
                    href={`/annuaire/${member.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-panel-raised"
                  >
                    <span>{personDisplayName(member)}</span>
                    <div className="flex items-center gap-2">
                      {member.mcMember?.grade ? <Badge tone="accent">{member.mcMember.grade}</Badge> : null}
                      <Badge>{member.category === "MC_MEMBER" ? "Membre" : "Prospect"}</Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Reunions recentes" />
        <CardBody className="p-0">
          {events.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">Aucune reunion enregistree.</p>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {events.map((event) => (
                <li key={event.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span>{event.title}</span>
                  <span className="text-xs text-muted">{event.startAt.toLocaleString("fr-FR")}</span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
