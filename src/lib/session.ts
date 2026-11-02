import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, canAccessAccounting, canManageWorkspace, isAdminOrOwner } from "@/lib/permissions";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Le JWT peut rester valide apres une desactivation de compte : on revalide en base
  // a chaque appel pour qu'une desactivation prenne effet immediatement.
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.isActive) redirect("/login");

  return session;
}

export async function requireOwnerSession() {
  const session = await requireSession();
  if (!canManageWorkspace(session.user.role)) throw new ForbiddenError();
  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (!isAdminOrOwner(session.user.role)) throw new ForbiddenError();
  return session;
}

// Recharge le flag canAccessAccounting a jour en base (le JWT peut etre perime
// si le OWNER vient juste d'accorder la permission).
export async function requireAccountingSession() {
  const session = await requireSession();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (!canAccessAccounting(user)) throw new ForbiddenError();
  return session;
}
