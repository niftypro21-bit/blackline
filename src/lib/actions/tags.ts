"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditableSession } from "@/lib/session";
import { dossierPathFor } from "@/lib/dossier";

export async function addTagToEntity(formData: FormData) {
  await requireEditableSession();
  const entityType = formData.get("entityType") as string;
  const entityId = formData.get("entityId") as string;
  const rawName = (formData.get("tagName") as string | null)?.trim().replace(/^#/, "");
  if (!rawName) return;

  const tag = await prisma.tag.upsert({
    where: { name: rawName },
    update: {},
    create: { name: rawName },
  });

  await prisma.tagLink.upsert({
    where: { tagId_entityType_entityId: { tagId: tag.id, entityType, entityId } },
    update: {},
    create: { tagId: tag.id, entityType, entityId },
  });

  revalidatePath(dossierPathFor(entityType, entityId));
}

export async function removeTagFromEntity(formData: FormData) {
  await requireEditableSession();
  const linkId = formData.get("linkId") as string;
  const entityType = formData.get("entityType") as string;
  const entityId = formData.get("entityId") as string;
  await prisma.tagLink.delete({ where: { id: linkId } });
  revalidatePath(dossierPathFor(entityType, entityId));
}

export async function listAllTags() {
  return prisma.tag.findMany({ orderBy: { name: "asc" } });
}
