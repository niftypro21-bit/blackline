export type UserRole = "OWNER" | "ADMIN" | "MEMBRE";
export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "OWNER", label: "Proprietaire" },
  { value: "ADMIN", label: "Administrateur" },
  { value: "MEMBRE", label: "Membre" },
];

export type OrderStatus = "EN_ATTENTE" | "APPROUVEE" | "REFUSEE";
export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "APPROUVEE", label: "Approuvee" },
  { value: "REFUSEE", label: "Refusee" },
];

export type AccountingEntryType = "RECETTE" | "DEPENSE";
export const ACCOUNTING_ENTRY_TYPES: { value: AccountingEntryType; label: string }[] = [
  { value: "RECETTE", label: "Recette" },
  { value: "DEPENSE", label: "Depense" },
];

export function labelFor<T extends string>(
  list: { value: T; label: string }[],
  value: T | null | undefined,
): string {
  return list.find((item) => item.value === value)?.label ?? value ?? "-";
}
