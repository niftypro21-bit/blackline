import type { UserRole, Visibility } from "@/lib/constants";

// Un seul OWNER existe aujourd'hui. Ces regles sont deja appliquees dans les
// requetes pour qu'ajouter un vrai COLLABORATOR plus tard ne demande aucune
// migration ni refonte des pages/actions.

export function allowedVisibilities(role: UserRole): Visibility[] {
  if (role === "OWNER") return ["PRIVATE", "SHARED", "RESTRICTED"];
  return ["SHARED"];
}

export function canView(visibility: Visibility, role: UserRole): boolean {
  return allowedVisibilities(role).includes(visibility);
}

export function canEdit(role: UserRole): boolean {
  return role === "OWNER";
}

export class ForbiddenError extends Error {
  constructor(message = "Action non autorisee pour ce role.") {
    super(message);
    this.name = "ForbiddenError";
  }
}
