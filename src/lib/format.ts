export function personDisplayName(person: {
  firstName: string;
  lastName?: string | null;
  nickname?: string | null;
}) {
  const full = `${person.firstName} ${person.lastName ?? ""}`.trim();
  return person.nickname ? `${full} «${person.nickname}»` : full;
}

export function vehicleDisplayName(vehicle: { make?: string | null; model?: string | null; plate?: string | null }) {
  return [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ") || "Vehicule";
}
