export type UserRole = "OWNER" | "COLLABORATOR";

export type Visibility = "PRIVATE" | "SHARED" | "RESTRICTED";
export const VISIBILITIES: { value: Visibility; label: string }[] = [
  { value: "PRIVATE", label: "Prive" },
  { value: "SHARED", label: "Partage" },
  { value: "RESTRICTED", label: "Groupe restreint" },
];

export type Reliability = "CONFIRMED" | "PROBABLE" | "UNVERIFIED" | "CONTRADICTORY";
export const RELIABILITIES: { value: Reliability; label: string }[] = [
  { value: "CONFIRMED", label: "Confirme" },
  { value: "PROBABLE", label: "Probable" },
  { value: "UNVERIFIED", label: "Non verifie" },
  { value: "CONTRADICTORY", label: "Contradictoire" },
];

export type PersonCategory =
  | "MC_MEMBER"
  | "PROSPECT"
  | "CIVIL"
  | "CONTACT"
  | "ENTERPRISE"
  | "UNKNOWN"
  | "OTHER";
export const PERSON_CATEGORIES: { value: PersonCategory; label: string }[] = [
  { value: "MC_MEMBER", label: "Membre MC" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "CIVIL", label: "Civil" },
  { value: "CONTACT", label: "Contact" },
  { value: "ENTERPRISE", label: "Entreprise" },
  { value: "UNKNOWN", label: "Personne inconnue" },
  { value: "OTHER", label: "Autre" },
];

export type OrganizationType =
  | "ENTERPRISE"
  | "GROUP"
  | "GANG_MC"
  | "PUBLIC_SERVICE"
  | "UNKNOWN"
  | "OTHER";
export const ORGANIZATION_TYPES: { value: OrganizationType; label: string }[] = [
  { value: "ENTERPRISE", label: "Entreprise" },
  { value: "GROUP", label: "Groupe" },
  { value: "GANG_MC", label: "Gang / MC" },
  { value: "PUBLIC_SERVICE", label: "Service public" },
  { value: "UNKNOWN", label: "Inconnue" },
  { value: "OTHER", label: "Autre" },
];

export type RelationEntityType = "PERSON" | "VEHICLE" | "ORGANIZATION" | "LOCATION";
export const RELATION_ENTITY_TYPES: { value: RelationEntityType; label: string }[] = [
  { value: "PERSON", label: "Personne" },
  { value: "VEHICLE", label: "Vehicule" },
  { value: "ORGANIZATION", label: "Organisation" },
  { value: "LOCATION", label: "Lieu" },
];

export type RelationType =
  | "OWNS"
  | "WORKS_FOR"
  | "FREQUENTS"
  | "KNOWS"
  | "PART_OF"
  | "ALLY_OF"
  | "RIVAL_OF"
  | "OTHER";
export const RELATION_TYPES: { value: RelationType; label: string }[] = [
  { value: "OWNS", label: "possede" },
  { value: "WORKS_FOR", label: "travaille pour" },
  { value: "FREQUENTS", label: "frequente" },
  { value: "KNOWS", label: "connait" },
  { value: "PART_OF", label: "fait partie de" },
  { value: "ALLY_OF", label: "allie de" },
  { value: "RIVAL_OF", label: "rival de" },
  { value: "OTHER", label: "autre" },
];

export type EventCategory = "MEETING" | "APPOINTMENT" | "EVENT" | "REMINDER" | "TASK";
export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "MEETING", label: "Reunion" },
  { value: "APPOINTMENT", label: "Rendez-vous" },
  { value: "EVENT", label: "Evenement" },
  { value: "REMINDER", label: "Rappel" },
  { value: "TASK", label: "Tache" },
];

export type SourceType = "OBSERVATION_PERSONNELLE" | "INFORMANT" | "DOCUMENT" | "RUMEUR" | "AUTRE";
export const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: "OBSERVATION_PERSONNELLE", label: "Observation personnelle" },
  { value: "INFORMANT", label: "Informant" },
  { value: "DOCUMENT", label: "Document" },
  { value: "RUMEUR", label: "Rumeur" },
  { value: "AUTRE", label: "Autre" },
];

export const DEFAULT_TAGS = [
  "MC",
  "Contact",
  "Prospect",
  "Entreprise",
  "Vehicule",
  "Observation",
  "Important",
  "A verifier",
];

export function labelFor<T extends string>(
  list: { value: T; label: string }[],
  value: T | null | undefined,
): string {
  return list.find((item) => item.value === value)?.label ?? value ?? "-";
}
