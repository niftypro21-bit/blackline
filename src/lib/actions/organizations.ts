"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireEditableSession } from "@/lib/session";
import { logCreate, logChanges } from "@/lib/activity";
import { ORGANIZATION_TYPES, RELIABILITIES, VISIBILITIES } from "@/lib/constants";
import { emptyToNull } from "@/lib/form";

const typeValues = ORGANIZATION_TYPES.map((t) => t.value) as [string, ...string[]];
const trustValues = RELIABILITIES.map((r) => r.value) as [string, ...string[]];
const visibilityValues = VISIBILITIES.map((v) => v.value) as [string, ...string[]];

const organizationSchema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  type: z.enum(typeValues),
  description: z.string().trim().nullable(),
  trustLevel: z.enum(trustValues).nullable(),
  visibility: z.enum(visibilityValues),
});

function parseOrganizationForm(formData: FormData) {
  return organizationSchema.parse({
    name: formData.get("name"),
    type: formData.get("type"),
    description: emptyToNull(formData.get("description")),
    trustLevel: emptyToNull(formData.get("trustLevel")),
    visibility: formData.get("visibility") || "PRIVATE",
  });
}

export async function createOrganization(formData: FormData) {
  await requireEditableSession();
  const data = parseOrganizationForm(formData);
  const organization = await prisma.organization.create({ data });
  await logCreate("ORGANIZATION", organization.id, organization.name);
  revalidatePath("/organisations");
  redirect(`/organisations/${organization.id}`);
}

export async function updateOrganization(id: string, formData: FormData) {
  await requireEditableSession();
  const data = parseOrganizationForm(formData);
  const before = await prisma.organization.findUniqueOrThrow({ where: { id } });
  const organization = await prisma.organization.update({ where: { id }, data });
  await logChanges("ORGANIZATION", id, before, organization);
  revalidatePath("/organisations");
  revalidatePath(`/organisations/${id}`);
  redirect(`/organisations/${id}`);
}
