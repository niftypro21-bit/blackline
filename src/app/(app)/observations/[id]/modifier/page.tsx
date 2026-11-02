import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ObservationForm } from "@/components/forms/ObservationForm";
import { updateObservation, listSourcesForSelect } from "@/lib/actions/observations";
import { listPersonsForSelect, listVehiclesForSelect, listLocationsForSelect } from "@/lib/actions/lookups";

export default async function EditObservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [observation, witnesses, persons, vehicles, locations, sources] = await Promise.all([
    prisma.observation.findUnique({ where: { id } }),
    prisma.observationWitness.findMany({ where: { observationId: id }, select: { personId: true } }),
    listPersonsForSelect(),
    listVehiclesForSelect(),
    listLocationsForSelect(),
    listSourcesForSelect(),
  ]);

  if (!observation) notFound();

  const action = updateObservation.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Modifier l&apos;observation</h1>
      </div>
      <ObservationForm
        action={action}
        observation={observation}
        witnessIds={witnesses.map((w) => w.personId)}
        persons={persons}
        vehicles={vehicles}
        locations={locations}
        sources={sources}
        cancelHref={`/observations/${observation.id}`}
      />
    </div>
  );
}
