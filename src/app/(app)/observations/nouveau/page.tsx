import { ObservationForm } from "@/components/forms/ObservationForm";
import { createObservation, listSourcesForSelect } from "@/lib/actions/observations";
import { listPersonsForSelect, listVehiclesForSelect, listLocationsForSelect } from "@/lib/actions/lookups";

export default async function NewObservationPage() {
  const [persons, vehicles, locations, sources] = await Promise.all([
    listPersonsForSelect(),
    listVehiclesForSelect(),
    listLocationsForSelect(),
    listSourcesForSelect(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Nouvelle observation</h1>
        <p className="mt-1 text-sm text-muted">Enregistrer ce que votre personnage a vu ou appris.</p>
      </div>
      <ObservationForm
        action={createObservation}
        persons={persons}
        vehicles={vehicles}
        locations={locations}
        sources={sources}
        cancelHref="/observations"
      />
    </div>
  );
}
