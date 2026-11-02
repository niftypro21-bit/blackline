"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireEditableSession } from "@/lib/session";
import { logAction } from "@/lib/activity";

export type ArchivableType =
  | "PERSON"
  | "VEHICLE"
  | "ORGANIZATION"
  | "LOCATION"
  | "OBSERVATION"
  | "NOTE"
  | "JOURNAL_ENTRY";

async function updateArchived(entityType: ArchivableType, entityId: string, archived: boolean) {
  switch (entityType) {
    case "PERSON":
      return prisma.person.update({ where: { id: entityId }, data: { archived } });
    case "VEHICLE":
      return prisma.vehicle.update({ where: { id: entityId }, data: { archived } });
    case "ORGANIZATION":
      return prisma.organization.update({ where: { id: entityId }, data: { archived } });
    case "LOCATION":
      return prisma.location.update({ where: { id: entityId }, data: { archived } });
    case "OBSERVATION":
      return prisma.observation.update({ where: { id: entityId }, data: { archived } });
    case "NOTE":
      return prisma.note.update({ where: { id: entityId }, data: { archived } });
    case "JOURNAL_ENTRY":
      return prisma.journalEntry.update({ where: { id: entityId }, data: { archived } });
  }
}

export async function setArchived(entityType: ArchivableType, entityId: string, archived: boolean) {
  await requireEditableSession();
  await updateArchived(entityType, entityId, archived);
  await logAction(archived ? "ARCHIVE" : "RESTORE", entityType, entityId);
  revalidatePath("/archives");
}

export async function archiveFromForm(formData: FormData) {
  const entityType = formData.get("entityType") as ArchivableType;
  const entityId = formData.get("entityId") as string;
  const redirectTo = formData.get("redirectTo") as string | null;
  await setArchived(entityType, entityId, true);
  if (redirectTo) redirect(redirectTo);
}

export async function restoreFromForm(formData: FormData) {
  const entityType = formData.get("entityType") as ArchivableType;
  const entityId = formData.get("entityId") as string;
  const redirectTo = formData.get("redirectTo") as string | null;
  await setArchived(entityType, entityId, false);
  if (redirectTo) redirect(redirectTo);
}
