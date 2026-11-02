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

const vehicleSchema = z.object({
  make: z.string().trim().nullable(),
  model: z.string().trim().nullable(),
  color: z.string().trim().nullable(),
  plate: z.string().trim().nullable(),
  ownerPersonId: z.string().trim().nullable(),
  ownerNote: z.string().trim().nullable(),
  photoUrl: z.string().trim().nullable(),
  description: z.string().trim().nullable(),
  visibility: z.enum(visibilityValues),
});

function parseVehicleForm(formData: FormData) {
  return vehicleSchema.parse({
    make: emptyToNull(formData.get("make")),
    model: emptyToNull(formData.get("model")),
    color: emptyToNull(formData.get("color")),
    plate: emptyToNull(formData.get("plate")),
    ownerPersonId: emptyToNull(formData.get("ownerPersonId")),
    ownerNote: emptyToNull(formData.get("ownerNote")),
    photoUrl: emptyToNull(formData.get("photoUrl")),
    description: emptyToNull(formData.get("description")),
    visibility: formData.get("visibility") || "PRIVATE",
  });
}

export async function createVehicle(formData: FormData) {
  await requireEditableSession();
  const data = parseVehicleForm(formData);
  const vehicle = await prisma.vehicle.create({ data });
  await logCreate(
    "VEHICLE",
    vehicle.id,
    [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ") || "Vehicule",
  );
  revalidatePath("/vehicules");
  redirect(`/vehicules/${vehicle.id}`);
}

export async function updateVehicle(id: string, formData: FormData) {
  await requireEditableSession();
  const data = parseVehicleForm(formData);
  const before = await prisma.vehicle.findUniqueOrThrow({ where: { id } });
  const vehicle = await prisma.vehicle.update({ where: { id }, data });
  await logChanges("VEHICLE", id, before, vehicle);
  revalidatePath("/vehicules");
  revalidatePath(`/vehicules/${id}`);
  redirect(`/vehicules/${id}`);
}
