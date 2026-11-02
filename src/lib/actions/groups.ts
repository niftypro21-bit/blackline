"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwnerSession } from "@/lib/session";
import { logCreate, logAction } from "@/lib/activity";
import { emptyToNull } from "@/lib/form";

const groupSchema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  description: z.string().trim().nullable(),
});

export async function createGroup(formData: FormData) {
  await requireOwnerSession();
  const data = groupSchema.parse({
    name: formData.get("name"),
    description: emptyToNull(formData.get("description")),
  });

  const group = await prisma.group.create({ data });
  await logCreate("GROUP", group.id, group.name);

  revalidatePath("/administration/groupes");
  redirect("/administration/groupes");
}

export async function updateGroup(id: string, formData: FormData) {
  await requireOwnerSession();
  const data = groupSchema.parse({
    name: formData.get("name"),
    description: emptyToNull(formData.get("description")),
  });

  await prisma.group.update({ where: { id }, data });
  await logAction("UPDATE", "GROUP", id);

  revalidatePath("/administration/groupes");
  redirect("/administration/groupes");
}

export async function deleteGroup(id: string) {
  await requireOwnerSession();
  await prisma.group.delete({ where: { id } });
  await logAction("DELETE", "GROUP", id);
  revalidatePath("/administration/groupes");
}

export async function setGroupAccess(userId: string, groupId: string, hasAccess: boolean) {
  await requireOwnerSession();

  if (hasAccess) {
    await prisma.groupMember.upsert({
      where: { userId_groupId: { userId, groupId } },
      update: {},
      create: { userId, groupId },
    });
  } else {
    await prisma.groupMember.deleteMany({ where: { userId, groupId } });
    // Retirer l'acces au groupe retire aussi l'acces a ses salons, pour eviter
    // qu'un compte garde un acces fin a un salon d'un groupe qu'il ne voit plus.
    const channels = await prisma.channel.findMany({ where: { groupId }, select: { id: true } });
    await prisma.channelMember.deleteMany({
      where: { userId, channelId: { in: channels.map((c) => c.id) } },
    });
  }

  await logAction("UPDATE", "GROUP_ACCESS", `${userId}:${groupId}`);
  revalidatePath("/administration/groupes");
}
