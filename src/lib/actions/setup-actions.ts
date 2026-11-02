"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { logCreate } from "@/lib/activity";
import { usernameSchema } from "@/lib/form";

const setupSchema = z.object({
  username: usernameSchema,
  password: z.string().min(8, "8 caracteres minimum"),
});

export async function createOwnerAccount(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  // Verification serveur obligatoire : /setup ne doit jamais pouvoir creer un second
  // compte privilegie, meme si la page a ete mise en cache ou rechargee en double.
  const existingCount = await prisma.user.count();
  if (existingCount > 0) {
    redirect("/login");
  }

  const parsed = setupSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Donnees invalides.";
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const owner = await prisma.$transaction(async (tx) => {
    const count = await tx.user.count();
    if (count > 0) {
      throw new Error("ALREADY_INITIALIZED");
    }
    return tx.user.create({
      data: {
        name: parsed.data.username,
        username: parsed.data.username,
        passwordHash,
        role: "OWNER",
        isActive: true,
      },
    });
  }).catch((error) => {
    if (error instanceof Error && error.message === "ALREADY_INITIALIZED") {
      redirect("/login");
    }
    throw error;
  });
  await logCreate("USER", owner.id, `Proprietaire cree : ${owner.name}`);

  redirect("/login");
}
