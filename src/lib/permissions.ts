import type { UserRole } from "@/lib/constants";

export class ForbiddenError extends Error {
  constructor(message = "Action non autorisee pour ce role.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function isOwner(role: UserRole): boolean {
  return role === "OWNER";
}

export function isAdminOrOwner(role: UserRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

// Approuver/refuser une commande est ouvert a tout ADMIN ou OWNER (pas de permission
// granulaire distincte demandee pour ce parcours, contrairement a la comptabilite).
export function canApproveOrders(role: UserRole): boolean {
  return isAdminOrOwner(role);
}

// La comptabilite est reservee au OWNER, ou a un ADMIN auquel le OWNER a explicitement
// accorde le flag canAccessAccounting.
export function canAccessAccounting(user: { role: string; canAccessAccounting: boolean }): boolean {
  if (user.role === "OWNER") return true;
  return user.role === "ADMIN" && user.canAccessAccounting;
}

// Gestion des comptes, groupes/salons et parametres : reservee au OWNER.
export function canManageWorkspace(role: UserRole): boolean {
  return role === "OWNER";
}
