import { VehicleForm } from "@/components/forms/VehicleForm";
import { createVehicle } from "@/lib/actions/vehicles";
import { listPersonsForSelect } from "@/lib/actions/lookups";

export default async function NewVehiclePage() {
  const persons = await listPersonsForSelect();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Nouveau vehicule</h1>
        <p className="mt-1 text-sm text-muted">Ajouter un vehicule repere en RP.</p>
      </div>
      <VehicleForm action={createVehicle} persons={persons} cancelHref="/vehicules" />
    </div>
  );
}
