"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwnerSession } from "@/lib/session";
import { logCreate, logAction } from "@/lib/activity";
import { emptyToNull } from "@/lib/form";

const channelSchema = z.object({
  groupId: z.string().trim().min(1),
  name: z.string().trim().min(1, "Nom requis"),
  description: z.string().trim().nullable(),
});

export async function createChannel(formData: FormData) {
  await requireOwnerSession();
  const data = channelSchema.parse({
    groupId: formData.get("groupId"),
    name: formData.get("name"),
    description: emptyToNull(formData.get("description")),
  });

  const channel = await prisma.channel.create({ data });
  await logCreate("CHANNEL", channel.id, channel.name);

  revalidatePath("/administration/groupes");
  redirect("/administration/groupes");
}

export async function updateChannel(id: string, formData: FormData) {
  await requireOwnerSession();
  const name = (formData.get("name") as string)?.trim();
  const description = emptyToNull(formData.get("description"));
  if (!name) throw new Error("Nom requis");

  await prisma.channel.update({ where: { id }, data: { name, description } });
  await logAction("UPDATE", "CHANNEL", id);

  revalidatePath("/administration/groupes");
  redirect("/administration/groupes");
}

export async function deleteChannel(id: string) {
  await requireOwnerSession();
  await prisma.channel.delete({ where: { id } });
  await logAction("DELETE", "CHANNEL", id);
  revalidatePath("/administration/groupes");
}

export async function setChannelAccess(userId: string, channelId: string, hasAccess: boolean) {
  await requireOwnerSession();

  if (hasAccess) {
    // Donner acces a un salon suppose l'acces au groupe parent.
    const channel = await prisma.channel.findUniqueOrThrow({ where: { id: channelId } });
    await prisma.groupMember.upsert({
      where: { userId_groupId: { userId, groupId: channel.groupId } },
      update: {},
      create: { userId, groupId: channel.groupId },
    });
    await prisma.channelMember.upsert({
      where: { userId_channelId: { userId, channelId } },
      update: {},
      create: { userId, channelId },
    });
  } else {
    await prisma.channelMember.deleteMany({ where: { userId, channelId } });
  }

  await logAction("UPDATE", "CHANNEL_ACCESS", `${userId}:${channelId}`);
  revalidatePath("/administration/groupes");
}
