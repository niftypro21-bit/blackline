import { prisma } from "@/lib/prisma";

const ROUTE_PREFIX: Record<string, string> = {
  PERSON: "/annuaire",
  VEHICLE: "/vehicules",
  ORGANIZATION: "/organisations",
  LOCATION: "/lieux",
  OBSERVATION: "/observations",
};

export function dossierPathFor(entityType: string, entityId: string): string {
  const base = ROUTE_PREFIX[entityType];
  return base ? `${base}/${entityId}` : "/";
}

export async function resolveEntityLabel(entityType: string, entityId: string): Promise<string> {
  switch (entityType) {
    case "PERSON": {
      const person = await prisma.person.findUnique({ where: { id: entityId } });
      return person ? `${person.firstName} ${person.lastName ?? ""}`.trim() : "Personne supprimee";
    }
    case "VEHICLE": {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: entityId } });
      if (!vehicle) return "Vehicule supprime";
      return [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ") || "Vehicule";
    }
    case "ORGANIZATION": {
      const org = await prisma.organization.findUnique({ where: { id: entityId } });
      return org?.name ?? "Organisation supprimee";
    }
    case "LOCATION": {
      const location = await prisma.location.findUnique({ where: { id: entityId } });
      return location?.name ?? "Lieu supprime";
    }
    default:
      return entityId;
  }
}

export interface DossierRelationship {
  id: string;
  direction: "from" | "to";
  relationType: string;
  label: string | null;
  reliability: string;
  otherType: string;
  otherId: string;
  otherLabel: string;
}

export interface DossierContext {
  notes: Awaited<ReturnType<typeof prisma.note.findMany>>;
  tags: { linkId: string; id: string; name: string; color: string | null }[];
  attachments: Awaited<ReturnType<typeof prisma.attachment.findMany>>;
  activity: Awaited<ReturnType<typeof prisma.activityLog.findMany>>;
  relationships: DossierRelationship[];
}

export async function getDossierContext(entityType: string, entityId: string): Promise<DossierContext> {
  const [notes, tagLinks, attachments, activity, relFrom, relTo] = await Promise.all([
    prisma.note.findMany({
      where: { entityType, entityId, archived: false },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tagLink.findMany({ where: { entityType, entityId }, include: { tag: true } }),
    prisma.attachment.findMany({ where: { entityType, entityId }, orderBy: { createdAt: "desc" } }),
    prisma.activityLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.relationship.findMany({ where: { fromType: entityType, fromId: entityId } }),
    prisma.relationship.findMany({ where: { toType: entityType, toId: entityId } }),
  ]);

  const relationships = await Promise.all([
    ...relFrom.map(async (r): Promise<DossierRelationship> => ({
      id: r.id,
      direction: "from",
      relationType: r.relationType,
      label: r.label,
      reliability: r.reliability,
      otherType: r.toType,
      otherId: r.toId,
      otherLabel: await resolveEntityLabel(r.toType, r.toId),
    })),
    ...relTo.map(async (r): Promise<DossierRelationship> => ({
      id: r.id,
      direction: "to",
      relationType: r.relationType,
      label: r.label,
      reliability: r.reliability,
      otherType: r.fromType,
      otherId: r.fromId,
      otherLabel: await resolveEntityLabel(r.fromType, r.fromId),
    })),
  ]);

  return {
    notes,
    tags: tagLinks.map((link) => ({
      linkId: link.id,
      id: link.tag.id,
      name: link.tag.name,
      color: link.tag.color,
    })),
    attachments,
    activity,
    relationships,
  };
}
