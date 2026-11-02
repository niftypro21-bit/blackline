"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { hasGroupAccess } from "@/lib/access";
import { ForbiddenError } from "@/lib/permissions";
import { logCreate } from "@/lib/activity";
import { notifyDiscord } from "@/lib/discord";
import { emptyToNull } from "@/lib/form";

const appointmentSchema = z.object({
  groupId: z.string().trim().min(1),
  title: z.string().trim().min(1, "Titre requis"),
  description: z.string().trim().nullable(),
  scheduledAt: z.string().trim().min(1, "Date requise"),
  location: z.string().trim().nullable(),
});

export async function createAppointment(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const session = await requireSession();
  const parsed = appointmentSchema.safeParse({
    groupId: formData.get("groupId"),
    title: formData.get("title"),
    description: emptyToNull(formData.get("description")),
    scheduledAt: formData.get("scheduledAt"),
    location: emptyToNull(formData.get("location")),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Donnees invalides.";

  const allowed = await hasGroupAccess(session.user.id, session.user.role, parsed.data.groupId);
  if (!allowed) throw new ForbiddenError("Acces a ce groupe non autorise.");

  const scheduledAt = new Date(parsed.data.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) return "Date invalide.";

  const appointment = await prisma.appointment.create({
    data: {
      groupId: parsed.data.groupId,
      proposedById: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      scheduledAt,
      location: parsed.data.location,
    },
  });
  await logCreate("APPOINTMENT", appointment.id, appointment.title);
  await notifyDiscord(`Nouveau rendez-vous propose : ${appointment.title}`);

  revalidatePath("/rendez-vous");
}
