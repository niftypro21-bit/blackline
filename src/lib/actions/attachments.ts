"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditableSession } from "@/lib/session";
import { logAction } from "@/lib/activity";
import { dossierPathFor } from "@/lib/dossier";

const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"]);

export async function uploadAttachment(formData: FormData) {
  await requireEditableSession();
  const entityType = formData.get("entityType") as string;
  const entityId = formData.get("entityId") as string;
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) return;
  if (file.size > MAX_SIZE_BYTES) throw new Error("Fichier trop volumineux (8 Mo max).");
  if (!ALLOWED_TYPES.has(file.type)) throw new Error("Type de fichier non autorise.");

  await mkdir(UPLOAD_DIR, { recursive: true });

  const extension = path.extname(file.name) || "";
  const storedName = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  const attachment = await prisma.attachment.create({
    data: {
      entityType,
      entityId,
      url: `/api/files/${storedName}`,
      filename: file.name,
      mimeType: file.type,
    },
  });

  await logAction("CREATE", "ATTACHMENT", attachment.id);
  revalidatePath(dossierPathFor(entityType, entityId));
}

export async function deleteAttachment(formData: FormData) {
  await requireEditableSession();
  const id = formData.get("id") as string;
  const attachment = await prisma.attachment.delete({ where: { id } });

  const storedName = attachment.url.split("/").pop();
  if (storedName) {
    await unlink(path.join(UPLOAD_DIR, storedName)).catch(() => {});
  }

  await logAction("DELETE", "ATTACHMENT", id);
  revalidatePath(dossierPathFor(attachment.entityType, attachment.entityId));
}
