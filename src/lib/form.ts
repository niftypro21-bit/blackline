import { z } from "zod";

// Convertit une valeur de formulaire vide en `null` (et non `undefined`) afin
// qu'un update Prisma efface reellement le champ au lieu de l'ignorer.
export function emptyToNull(value: FormDataEntryValue | null): string | null {
  const str = (value as string) ?? "";
  return str.trim() === "" ? null : str;
}

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "3 caracteres minimum")
  .max(24, "24 caracteres maximum")
  .regex(/^[a-zA-Z0-9_-]+$/, "Lettres, chiffres, _ et - uniquement");
