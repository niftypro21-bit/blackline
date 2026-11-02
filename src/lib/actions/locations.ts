"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireEditableSession } from "@/lib/session";
import { logCreate, logChanges } from "@/lib/activity";
import { VISIBILITIES } from "@/lib/constants";
import { emptyToNull } from "@/lib/form";

const visibilityValues = VISIBILITIES.map((v) => v.value) as [string, ...string[]];

const locationSchema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  address: z.string().trim().nullable(),
  category: z.string().trim().nullable(),
  description: z.string().trim().nullable(),
  lat: z.coerce.number().nullable(),
  lng: z.coerce.number().nullable(),
  visibility: z.enum(visibilityValues),
});

function parseLocationForm(formData: FormData) {
  return locationSchema.parse({
    name: formData.get("name"),
    address: emptyToNull(formData.get("address")),
    category: emptyToNull(formData.get("category")),
    description: emptyToNull(formData.get("description")),
    lat: emptyToNull(formData.get("lat")),
    lng: emptyToNull(formData.get("lng")),
    visibility: formData.get("visibility") || "PRIVATE",
  });
}

export async function createLocation(formData: FormData) {
  await requireEditableSession();
  const data = parseLocationForm(formData);
  const location = await prisma.location.create({ data });
  await logCreate("LOCATION", location.id, location.name);
  revalidatePath("/lieux");
  redirect(`/lieux/${location.id}`);
}

export async function updateLocation(id: string, formData: FormData) {
  await requireEditableSession();
  const data = parseLocationForm(formData);
  const before = await prisma.location.findUniqueOrThrow({ where: { id } });
  const location = await prisma.location.update({ where: { id }, data });
  await logChanges("LOCATION", id, before, location);
  revalidatePath("/lieux");
  revalidatePath(`/lieux/${id}`);
  redirect(`/lieux/${id}`);
}
