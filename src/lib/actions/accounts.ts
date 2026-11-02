"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerSession } from "@/lib/session";
import { logCreate, logAction } from "@/lib/activity";
import { USER_ROLES } from "@/lib/constants";
import { usernameSchema } from "@/lib/form";

const roleValues = USER_ROLES.map((r) => r.value) as [string, ...string[]];

const createAccountSchema = z.object({
  username: usernameSchema,
  password: z.string().min(8, "8 caracteres minimum"),
  role: z.enum(roleValues),
});

export async function createAccount(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  await requireOwnerSession();

  const parsed = createAccountSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Donnees invalides.";

  // Un seul OWNER doit exister : le flow /setup est le seul endroit qui en cree un.
  if (parsed.data.role === "OWNER") return "Un seul proprietaire peut exister.";

  const existing = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (existing) return "Ce pseudo est deja utilise.";

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.username,
      username: parsed.data.username,
      passwordHash,
      role: parsed.data.role,
    },
  });
  await logCreate("USER", user.id, `Compte cree : ${user.name} (${user.role})`);

  revalidatePath("/administration/comptes");
}

export async function setAccountRole(userId: string, role: string) {
  await requireOwnerSession();
  if (role === "OWNER") throw new Error("Un seul proprietaire peut exister.");
  if (!roleValues.includes(role)) throw new Error("Role invalide.");

  await prisma.user.update({ where: { id: userId }, data: { role } });
  await logAction("UPDATE", "USER", userId);
  revalidatePath("/administration/comptes");
}

export async function setAccountActive(userId: string, isActive: boolean) {
  const session = await requireOwnerSession();
  if (userId === session.user.id) throw new Error("Impossible de desactiver votre propre compte.");

  await prisma.user.update({ where: { id: userId }, data: { isActive } });
  await logAction(isActive ? "RESTORE" : "ARCHIVE", "USER", userId);
  revalidatePath("/administration/comptes");
}

export async function setAccountingPermission(userId: string, canAccessAccounting: boolean) {
  await requireOwnerSession();
  await prisma.user.update({ where: { id: userId }, data: { canAccessAccounting } });
  await logAction("UPDATE", "USER", userId);
  revalidatePath("/administration/comptes");
}

const resetPasswordSchema = z.object({
  password: z.string().min(8, "8 caracteres minimum"),
});

export async function resetAccountPassword(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  await requireOwnerSession();

  const userId = formData.get("userId") as string;
  const parsed = resetPasswordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Mot de passe invalide.";

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await logAction("UPDATE", "USER", userId);

  revalidatePath("/administration/comptes");
}
