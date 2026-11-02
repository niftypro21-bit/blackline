"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireEditableSession } from "@/lib/session";
import { logCreate, logChanges } from "@/lib/activity";
import { PERSON_CATEGORIES, RELIABILITIES, VISIBILITIES } from "@/lib/constants";
import { emptyToNull } from "@/lib/form";

const categoryValues = PERSON_CATEGORIES.map((c) => c.value) as [string, ...string[]];
const reliabilityValues = RELIABILITIES.map((r) => r.value) as [string, ...string[]];
const visibilityValues = VISIBILITIES.map((v) => v.value) as [string, ...string[]];

const personSchema = z.object({
  firstName: z.string().trim().min(1, "Prenom requis"),
  lastName: z.string().trim().nullable(),
  nickname: z.string().trim().nullable(),
  photoUrl: z.string().trim().nullable(),
  profession: z.string().trim().nullable(),
  phone: z.string().trim().nullable(),
  category: z.enum(categoryValues),
  statusNote: z.string().trim().nullable(),
  organizationId: z.string().trim().nullable(),
  description: z.string().trim().nullable(),
  reliability: z.enum(reliabilityValues).nullable(),
  visibility: z.enum(visibilityValues),
});

function parsePersonForm(formData: FormData) {
  return personSchema.parse({
    firstName: formData.get("firstName"),
    lastName: emptyToNull(formData.get("lastName")),
    nickname: emptyToNull(formData.get("nickname")),
    photoUrl: emptyToNull(formData.get("photoUrl")),
    profession: emptyToNull(formData.get("profession")),
    phone: emptyToNull(formData.get("phone")),
    category: formData.get("category"),
    statusNote: emptyToNull(formData.get("statusNote")),
    organizationId: emptyToNull(formData.get("organizationId")),
    description: emptyToNull(formData.get("description")),
    reliability: emptyToNull(formData.get("reliability")),
    visibility: formData.get("visibility") || "PRIVATE",
  });
}

export async function createPerson(formData: FormData) {
  await requireEditableSession();
  const data = parsePersonForm(formData);

  const person = await prisma.person.create({ data });
  await logCreate("PERSON", person.id, `${person.firstName} ${person.lastName ?? ""}`.trim());

  revalidatePath("/annuaire");
  redirect(`/annuaire/${person.id}`);
}

export async function updatePerson(id: string, formData: FormData) {
  await requireEditableSession();
  const data = parsePersonForm(formData);

  const before = await prisma.person.findUniqueOrThrow({ where: { id } });
  const person = await prisma.person.update({ where: { id }, data });
  await logChanges("PERSON", id, before, person);

  revalidatePath("/annuaire");
  revalidatePath(`/annuaire/${id}`);
  redirect(`/annuaire/${id}`);
}
