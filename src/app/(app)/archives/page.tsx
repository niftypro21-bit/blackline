import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { restoreFromForm } from "@/lib/actions/archive";
import { personDisplayName, vehicleDisplayName } from "@/lib/format";

export default async function ArchivesPage() {
  const [persons, vehicles, organizations, locations, observations, notes, journalEntries] =
    await Promise.all([
      prisma.person.findMany({ where: { archived: true }, orderBy: { updatedAt: "desc" } }),
      prisma.vehicle.findMany({ where: { archived: true }, orderBy: { updatedAt: "desc" } }),
      prisma.organization.findMany({ where: { archived: true }, orderBy: { updatedAt: "desc" } }),
      prisma.location.findMany({ where: { archived: true }, orderBy: { updatedAt: "desc" } }),
      prisma.observation.findMany({ where: { archived: true }, orderBy: { updatedAt: "desc" } }),
      prisma.note.findMany({ where: { archived: true }, orderBy: { updatedAt: "desc" } }),
      prisma.journalEntry.findMany({ where: { archived: true }, orderBy: { updatedAt: "desc" } }),
    ]);

  const sections = [
    {
      title: "Personnes",
      entityType: "PERSON" as const,
      items: persons.map((p) => ({ id: p.id, label: personDisplayName(p), href: `/annuaire/${p.id}` })),
    },
    {
      title: "Vehicules",
      entityType: "VEHICLE" as const,
      items: vehicles.map((v) => ({ id: v.id, label: vehicleDisplayName(v), href: `/vehicules/${v.id}` })),
    },
    {
      title: "Organisations",
      entityType: "ORGANIZATION" as const,
      items: organizations.map((o) => ({ id: o.id, label: o.name, href: `/organisations/${o.id}` })),
    },
    {
      title: "Lieux",
      entityType: "LOCATION" as const,
      items: locations.map((l) => ({ id: l.id, label: l.name, href: `/lieux/${l.id}` })),
    },
    {
      title: "Observations",
      entityType: "OBSERVATION" as const,
      items: observations.map((o) => ({
        id: o.id,
        label: o.description.slice(0, 70),
        href: `/observations/${o.id}`,
      })),
    },
    {
      title: "Notes",
      entityType: "NOTE" as const,
      items: notes.map((n) => ({ id: n.id, label: n.title || n.content.slice(0, 70), href: "#" })),
    },
    {
      title: "Entrees de journal",
      entityType: "JOURNAL_ENTRY" as const,
      items: journalEntries.map((j) => ({
        id: j.id,
        label: j.date.toLocaleDateString("fr-FR"),
        href: `/journal/${j.id}`,
      })),
    },
  ];

  const totalCount = sections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Archives</h1>
        <p className="mt-1 text-sm text-muted">Dossiers, observations et notes archives.</p>
      </div>

      {totalCount === 0 ? (
        <EmptyState title="Rien dans les archives" description="Les elements archives apparaitront ici." />
      ) : (
        sections
          .filter((s) => s.items.length > 0)
          .map((section) => (
            <Card key={section.title}>
              <CardHeader title={section.title} />
              <CardBody className="p-0">
                <ul className="divide-y divide-border-subtle">
                  {section.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                      <Link href={item.href} className="truncate text-foreground hover:text-accent">
                        {item.label}
                      </Link>
                      <form action={restoreFromForm}>
                        <input type="hidden" name="entityType" value={section.entityType} />
                        <input type="hidden" name="entityId" value={item.id} />
                        <Button type="submit" variant="ghost">
                          Restaurer
                        </Button>
                      </form>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))
      )}
    </div>
  );
}
