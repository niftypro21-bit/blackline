// Convertit une valeur de formulaire vide en `null` (et non `undefined`) afin
// qu'un update Prisma efface reellement le champ au lieu de l'ignorer.
export function emptyToNull(value: FormDataEntryValue | null): string | null {
  const str = (value as string) ?? "";
  return str.trim() === "" ? null : str;
}
