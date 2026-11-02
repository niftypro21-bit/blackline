"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditableSession } from "@/lib/session";
import { logCreate, logAction } from "@/lib/activity";
import { dossierPathFor } from "@/lib/dossier";

const noteSchema = z.object({
  title: z.string().trim().optional(),
  content: z.string().trim().min(1, "Contenu requis"),
  entityType: z.string().trim().optional(),
  entityId: z.string().trim().optional(),
  visibility: z.enum(["PRIVATE", "SHARED", "RESTRICTED"]),
});

function orUndefined(value: FormDataEntryValue | null) {
  const str = (value as string) ?? "";
  return str.trim() === "" ? undefined : str;
}

export async function createNoteAction(formData: FormData) {
  await requireEditableSession();
  const data = noteSchema.parse({
    title: orUndefined(formData.get("title")),
    content: formData.get("content"),
    entityType: orUndefined(formData.get("entityType")),
    entityId: orUndefined(formData.get("entityId")),
    visibility: formData.get("visibility") || "PRIVATE",
  });

  const note = await prisma.note.create({ data });
  await logCreate("NOTE", note.id, note.title ?? note.content.slice(0, 60));

  if (data.entityType && data.entityId) {
    revalidatePath(dossierPathFor(data.entityType, data.entityId));
  } else {
    revalidatePath("/journal");
  }
}

export async function deleteNoteAction(formData: FormData) {
  await requireEditableSession();
  const id = formData.get("id") as string;
  const note = await prisma.note.delete({ where: { id } });
  await logAction("DELETE", "NOTE", id);

  if (note.entityType && note.entityId) {
    revalidatePath(dossierPathFor(note.entityType, note.entityId));
  } else {
    revalidatePath("/journal");
  }
}
