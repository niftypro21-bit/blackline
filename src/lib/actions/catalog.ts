"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwnerSession } from "@/lib/session";
import { logCreate, logChanges, logAction } from "@/lib/activity";
import { emptyToNull } from "@/lib/form";

const itemSchema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  description: z.string().trim().nullable(),
  price: z.coerce.number().int().min(0, "Prix invalide"),
  quantity: z.coerce.number().int().min(0, "Quantite invalide"),
});

function parseItemForm(formData: FormData) {
  return itemSchema.parse({
    name: formData.get("name"),
    description: emptyToNull(formData.get("description")),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
  });
}

export async function createCatalogItem(formData: FormData) {
  await requireOwnerSession();
  const data = parseItemForm(formData);

  const item = await prisma.catalogItem.create({ data });
  await logCreate("CATALOG_ITEM", item.id, item.name);

  revalidatePath("/inventaire");
  redirect("/inventaire");
}

export async function updateCatalogItem(id: string, formData: FormData) {
  await requireOwnerSession();
  const data = parseItemForm(formData);

  const before = await prisma.catalogItem.findUniqueOrThrow({ where: { id } });
  const item = await prisma.catalogItem.update({ where: { id }, data });
  await logChanges("CATALOG_ITEM", id, before, item);

  revalidatePath("/inventaire");
  redirect("/inventaire");
}

export async function setCatalogItemArchived(id: string, archived: boolean) {
  await requireOwnerSession();
  await prisma.catalogItem.update({ where: { id }, data: { archived } });
  await logAction(archived ? "ARCHIVE" : "RESTORE", "CATALOG_ITEM", id);
  revalidatePath("/inventaire");
}
