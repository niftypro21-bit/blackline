import { prisma } from "@/lib/prisma";
import { getGraphData } from "@/lib/graph";
import { RelationshipGraph } from "@/components/graph/RelationshipGraph";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Field, Select, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { ReliabilityBadge } from "@/components/ui/Badge";
import { createRelationship, deleteRelationship } from "@/lib/actions/relationships";
import { RELATION_TYPES, RELIABILITIES, VISIBILITIES, labelFor, type Reliability } from "@/lib/constants";
import { personDisplayName, vehicleDisplayName } from "@/lib/format";

export default async function RelationsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  const [graph, persons, vehicles, organizations, locations, relationships] = await Promise.all([
    getGraphData(),
    prisma.person.findMany({ where: { archived: false }, orderBy: { firstName: "asc" } }),
    prisma.vehicle.findMany({ where: { archived: false }, orderBy: { createdAt: "desc" } }),
    prisma.organization.findMany({ where: { archived: false }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { archived: false }, orderBy: { name: "asc" } }),
    prisma.relationship.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const entityOptions = [
    { label: "Personnes", options: persons.map((p) => ({ value: `PERSON:${p.id}`, label: personDisplayName(p) })) },
    { label: "Vehicules", options: vehicles.map((v) => ({ value: `VEHICLE:${v.id}`, label: vehicleDisplayName(v) })) },
    { label: "Organisations", options: organizations.map((o) => ({ value: `ORGANIZATION:${o.id}`, label: o.name })) },
    { label: "Lieux", options: locations.map((l) => ({ value: `LOCATION:${l.id}`, label: l.name })) },
  ];

  const graphLabels = new Map(graph.nodes.map((n) => [n.id, n.label]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Relations</h1>
        <p className="mt-1 text-sm text-muted">
          Connexions entre personnes, vehicules, organisations et lieux.
        </p>
      </div>

      <RelationshipGraph nodes={graph.nodes} edges={graph.edges} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Ajouter une relation" />
          <CardBody>
            <form action={createRelationship} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Origine" htmlFor="from">
                  <Select id="from" name="from" defaultValue={from ?? ""} required>
                    <option value="" disabled>
                      Choisir...
                    </option>
                    {entityOptions.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </Field>
                <Field label="Type de relation" htmlFor="relationType">
                  <Select id="relationType" name="relationType" defaultValue="KNOWS">
                    {RELATION_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Destination" htmlFor="to" className="sm:col-span-2">
                  <Select id="to" name="to" defaultValue="" required>
                    <option value="" disabled>
                      Choisir...
                    </option>
                    {entityOptions.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </Field>
                <Field label="Libelle personnalise (optionnel)" htmlFor="label">
                  <Input id="label" name="label" />
                </Field>
                <Field label="Fiabilite" htmlFor="reliability">
                  <Select id="reliability" name="reliability" defaultValue="UNVERIFIED">
                    {RELIABILITIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Visibilite" htmlFor="visibility">
                  <Select id="visibility" name="visibility" defaultValue="PRIVATE">
                    {VISIBILITIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Notes" htmlFor="notes">
                <Textarea id="notes" name="notes" />
              </Field>
              <Button type="submit" variant="primary" className="self-end">
                Ajouter la relation
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Relations enregistrees" subtitle="Hors liens automatiques (proprietaire, organisation)" />
          <CardBody className="p-0">
            {relationships.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted">Aucune relation ajoutee manuellement.</p>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {relationships.map((rel) => (
                  <li key={rel.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <span className="truncate">
                      {graphLabels.get(`${rel.fromType}:${rel.fromId}`) ?? rel.fromId}{" "}
                      <span className="text-muted">
                        {rel.label || labelFor(RELATION_TYPES, rel.relationType as never)}
                      </span>{" "}
                      {graphLabels.get(`${rel.toType}:${rel.toId}`) ?? rel.toId}
                    </span>
                    <div className="flex items-center gap-2">
                      <ReliabilityBadge value={rel.reliability as Reliability} />
                      <form action={deleteRelationship}>
                        <input type="hidden" name="id" value={rel.id} />
                        <ConfirmButton confirmMessage="Supprimer cette relation ?">&times;</ConfirmButton>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
