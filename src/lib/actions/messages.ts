"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { hasChannelAccess } from "@/lib/access";
import { ForbiddenError } from "@/lib/permissions";

const messageSchema = z.object({
  content: z.string().trim().min(1, "Message vide"),
});

export async function sendMessage(channelId: string, formData: FormData) {
  const session = await requireSession();
  const data = messageSchema.parse({ content: formData.get("content") });

  const allowed = await hasChannelAccess(session.user.id, session.user.role, channelId);
  if (!allowed) throw new ForbiddenError("Acces a ce salon non autorise.");

  await prisma.message.create({
    data: { channelId, authorId: session.user.id, content: data.content },
  });

  revalidatePath(`/messages/${channelId}`);
}
