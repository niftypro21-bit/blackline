"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAccountingSession } from "@/lib/session";
import { logCreate, logAction } from "@/lib/activity";
import { ACCOUNTING_ENTRY_TYPES } from "@/lib/constants";
import { emptyToNull } from "@/lib/form";

const typeValues = ACCOUNTING_ENTRY_TYPES.map((t) => t.value) as [string, ...string[]];

const entrySchema = z.object({
  type: z.enum(typeValues),
  label: z.string().trim().min(1, "Libelle requis"),
  amount: z.coerce.number().int().min(0, "Montant invalide"),
  date: z.string().trim().min(1, "Date requise"),
  notes: z.string().trim().nullable(),
});

export async function createAccountingEntry(formData: FormData) {
  const session = await requireAccountingSession();
  const parsed = entrySchema.parse({
    type: formData.get("type"),
    label: formData.get("label"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    notes: emptyToNull(formData.get("notes")),
  });

  const date = new Date(parsed.date);
  const entry = await prisma.accountingEntry.create({
    data: { ...parsed, date, createdById: session.user.id },
  });
  await logCreate("ACCOUNTING_ENTRY", entry.id, `${entry.type} ${entry.label} ${entry.amount}`);

  revalidatePath("/comptabilite");
  redirect("/comptabilite");
}

export async function deleteAccountingEntry(id: string) {
  await requireAccountingSession();
  await prisma.accountingEntry.delete({ where: { id } });
  await logAction("DELETE", "ACCOUNTING_ENTRY", id);
  revalidatePath("/comptabilite");
}
