import { LocationForm } from "@/components/forms/LocationForm";
import { createLocation } from "@/lib/actions/locations";

export default function NewLocationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-foreground">Nouveau lieu</h1>
        <p className="mt-1 text-sm text-muted">Ajouter un lieu important.</p>
      </div>
      <LocationForm action={createLocation} cancelHref="/lieux" />
    </div>
  );
}
