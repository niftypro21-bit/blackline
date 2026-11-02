import { prisma } from "@/lib/prisma";
import { dossierPathFor } from "@/lib/dossier";
import { personDisplayName, vehicleDisplayName } from "@/lib/format";
import { PERSON_CATEGORIES, labelFor, type PersonCategory } from "@/lib/constants";

export interface SearchResult {
  type: "PERSON" | "VEHICLE" | "ORGANIZATION" | "LOCATION" | "NOTE" | "TAG";
  id: string;
  label: string;
  meta?: string;
  href: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const [persons, vehicles, organizations, locations, notes, tags] = await Promise.all([
    prisma.person.findMany({
      where: {
        archived: false,
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { nickname: { contains: q } },
          { phone: { contains: q } },
        ],
      },
      take: 20,
    }),
    prisma.vehicle.findMany({
      where: {
        archived: false,
        OR: [{ plate: { contains: q } }, { make: { contains: q } }, { model: { contains: q } }],
      },
      take: 20,
    }),
    prisma.organization.findMany({
      where: { archived: false, name: { contains: q } },
      take: 20,
    }),
    prisma.location.findMany({
      where: { archived: false, OR: [{ name: { contains: q } }, { address: { contains: q } }] },
      take: 20,
    }),
    prisma.note.findMany({
      where: { archived: false, content: { contains: q } },
      take: 20,
    }),
    prisma.tag.findMany({
      where: { name: { contains: q.replace(/^#/, "") } },
      include: { links: true },
      take: 10,
    }),
  ]);

  const results: SearchResult[] = [];

  for (const person of persons) {
    results.push({
      type: "PERSON",
      id: person.id,
      label: personDisplayName(person),
      meta: labelFor(PERSON_CATEGORIES, person.category as PersonCategory),
      href: `/annuaire/${person.id}`,
    });
  }
  for (const vehicle of vehicles) {
    results.push({
      type: "VEHICLE",
      id: vehicle.id,
      label: vehicleDisplayName(vehicle),
      meta: vehicle.plate ?? undefined,
      href: `/vehicules/${vehicle.id}`,
    });
  }
  for (const organization of organizations) {
    results.push({
      type: "ORGANIZATION",
      id: organization.id,
      label: organization.name,
      href: `/organisations/${organization.id}`,
    });
  }
  for (const location of locations) {
    results.push({
      type: "LOCATION",
      id: location.id,
      label: location.name,
      meta: location.address ?? undefined,
      href: `/lieux/${location.id}`,
    });
  }
  for (const note of notes) {
    results.push({
      type: "NOTE",
      id: note.id,
      label: note.title || note.content.slice(0, 60),
      meta: "Note",
      href: note.entityType && note.entityId ? dossierPathFor(note.entityType, note.entityId) : "/journal",
    });
  }
  for (const tag of tags) {
    for (const link of tag.links) {
      results.push({
        type: "TAG",
        id: link.id,
        label: `#${tag.name}`,
        meta: link.entityType,
        href: dossierPathFor(link.entityType, link.entityId),
      });
    }
  }

  return results;
}
