import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VehicleForm } from "@/components/forms/VehicleForm";
import { updateVehicle } from "@/lib/actions/vehicles";
import { listPersonsForSelect } from "@/lib/actions/lookups";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [vehicle, persons] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id } }),
    listPersonsForSelect(),
  ]);
  if (!vehicle) notFound();

  const action = updateVehicle.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Modifier le vehicule</h1>
        <p className="mt-1 text-sm text-muted">{vehicle.plate || "Vehicule"}</p>
      </div>
      <VehicleForm action={action} vehicle={vehicle} persons={persons} cancelHref={`/vehicules/${vehicle.id}`} />
    </div>
  );
}
