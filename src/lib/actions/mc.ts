"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireEditableSession } from "@/lib/session";
import { logCreate, logChanges } from "@/lib/activity";
import { emptyToNull } from "@/lib/form";

const mcMemberSchema = z.object({
  grade: z.string().trim().nullable(),
  joinDate: z
    .string()
    .nullable()
    .transform((value) => (value ? new Date(value) : null)),
  sponsorId: z.string().trim().nullable(),
  patchStatus: z.string().trim().nullable(),
  notes: z.string().trim().nullable(),
});

function parseMcMemberForm(formData: FormData) {
  return mcMemberSchema.parse({
    grade: emptyToNull(formData.get("grade")),
    joinDate: emptyToNull(formData.get("joinDate")),
    sponsorId: emptyToNull(formData.get("sponsorId")),
    patchStatus: emptyToNull(formData.get("patchStatus")),
    notes: emptyToNull(formData.get("notes")),
  });
}

export async function upsertMcMember(personId: string, formData: FormData) {
  await requireEditableSession();
  const data = parseMcMemberForm(formData);
  const existing = await prisma.mCMember.findUnique({ where: { personId } });

  if (existing) {
    const updated = await prisma.mCMember.update({ where: { personId }, data });
    await logChanges("MC_MEMBER", updated.id, existing, updated);
  } else {
    const created = await prisma.mCMember.create({ data: { personId, ...data } });
    await logCreate("MC_MEMBER", created.id, "Fiche MC creee");
  }

  revalidatePath("/mc");
  revalidatePath(`/annuaire/${personId}`);
  redirect(`/annuaire/${personId}`);
}
