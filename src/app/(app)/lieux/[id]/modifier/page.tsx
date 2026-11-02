import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LocationForm } from "@/components/forms/LocationForm";
import { updateLocation } from "@/lib/actions/locations";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const location = await prisma.location.findUnique({ where: { id } });
  if (!location) notFound();

  const action = updateLocation.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Modifier le lieu</h1>
        <p className="mt-1 text-sm text-muted">{location.name}</p>
      </div>
      <LocationForm action={action} location={location} cancelHref={`/lieux/${location.id}`} />
    </div>
  );
}
