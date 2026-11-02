import { prisma } from "@/lib/prisma";
import { personDisplayName, vehicleDisplayName } from "@/lib/format";
import { labelFor, RELATION_TYPES, type RelationType } from "@/lib/constants";

export interface GraphNode {
  id: string;
  type: string;
  label: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  reliability: string;
}

export async function getGraphData(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const [persons, vehicles, organizations, locations, relationships] = await Promise.all([
    prisma.person.findMany({
      where: { archived: false },
      select: { id: true, firstName: true, lastName: true, nickname: true, organizationId: true },
    }),
    prisma.vehicle.findMany({
      where: { archived: false },
      select: { id: true, make: true, model: true, plate: true, ownerPersonId: true },
    }),
    prisma.organization.findMany({ where: { archived: false }, select: { id: true, name: true } }),
    prisma.location.findMany({ where: { archived: false }, select: { id: true, name: true } }),
    prisma.relationship.findMany(),
  ]);

  const nodes: GraphNode[] = [
    ...persons.map((p) => ({ id: `PERSON:${p.id}`, type: "PERSON", label: personDisplayName(p) })),
    ...vehicles.map((v) => ({ id: `VEHICLE:${v.id}`, type: "VEHICLE", label: vehicleDisplayName(v) })),
    ...organizations.map((o) => ({ id: `ORGANIZATION:${o.id}`, type: "ORGANIZATION", label: o.name })),
    ...locations.map((l) => ({ id: `LOCATION:${l.id}`, type: "LOCATION", label: l.name })),
  ];

  const edges: GraphEdge[] = [];

  for (const person of persons) {
    if (person.organizationId) {
      edges.push({
        source: `PERSON:${person.id}`,
        target: `ORGANIZATION:${person.organizationId}`,
        label: "travaille pour",
        reliability: "CONFIRMED",
      });
    }
  }
  for (const vehicle of vehicles) {
    if (vehicle.ownerPersonId) {
      edges.push({
        source: `PERSON:${vehicle.ownerPersonId}`,
        target: `VEHICLE:${vehicle.id}`,
        label: "possede",
        reliability: "CONFIRMED",
      });
    }
  }
  for (const relationship of relationships) {
    edges.push({
      source: `${relationship.fromType}:${relationship.fromId}`,
      target: `${relationship.toType}:${relationship.toId}`,
      label: relationship.label || labelFor(RELATION_TYPES, relationship.relationType as RelationType),
      reliability: relationship.reliability,
    });
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  return { nodes, edges: edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target)) };
}
