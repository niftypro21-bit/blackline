"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canApproveOrders, ForbiddenError } from "@/lib/permissions";
import { logCreate, logAction } from "@/lib/activity";
import { notifyDiscord } from "@/lib/discord";

const cartSchema = z
  .array(
    z.object({
      catalogItemId: z.string().trim().min(1),
      quantity: z.coerce.number().int().min(1),
    }),
  )
  .min(1, "Panier vide");

// Cree une commande par article du panier, en une seule notification Discord groupee.
export async function createCartOrders(
  items: { catalogItemId: string; quantity: number }[],
): Promise<string | undefined> {
  const session = await requireSession();
  const parsed = cartSchema.safeParse(items);
  if (!parsed.success) return "Panier invalide.";

  const catalogItems = await prisma.catalogItem.findMany({
    where: { id: { in: parsed.data.map((i) => i.catalogItemId) } },
  });
  const byId = new Map(catalogItems.map((item) => [item.id, item]));

  for (const line of parsed.data) {
    const item = byId.get(line.catalogItemId);
    if (!item || item.archived) return "Un article du panier n'est plus disponible.";
    if (line.quantity > item.quantity) return `Stock insuffisant pour "${item.name}".`;
  }

  const summaryLines: string[] = [];
  await prisma.$transaction(
    parsed.data.map((line) => {
      const item = byId.get(line.catalogItemId)!;
      summaryLines.push(`${line.quantity} x ${item.name}`);
      return prisma.order.create({
        data: { catalogItemId: line.catalogItemId, quantity: line.quantity, requestedById: session.user.id },
      });
    }),
  );

  await logCreate("ORDER", "CART", summaryLines.join(", "));
  await notifyDiscord(
    `Nouvelle commande (marche noir) de ${session.user.name} :\n- ${summaryLines.join("\n- ")}`,
  );

  revalidatePath("/commandes");
  revalidatePath("/inventaire");
}

export async function decideOrder(orderId: string, approve: boolean) {
  const session = await requireSession();
  if (!canApproveOrders(session.user.role)) throw new ForbiddenError();

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { catalogItem: true },
  });
  if (order.status !== "EN_ATTENTE") throw new Error("Cette commande a deja ete traitee.");

  if (approve) {
    // Transaction : re-verifie le stock au moment de l'approbation pour eviter une
    // double-deduction en cas d'approbations concurrentes, et ne deduit qu'une seule fois.
    await prisma.$transaction(async (tx) => {
      const item = await tx.catalogItem.findUniqueOrThrow({ where: { id: order.catalogItemId } });
      if (order.quantity > item.quantity) {
        throw new Error("Stock insuffisant pour approuver cette commande.");
      }
      await tx.catalogItem.update({
        where: { id: item.id },
        data: { quantity: item.quantity - order.quantity },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status: "APPROUVEE", decidedById: session.user.id, decidedAt: new Date() },
      });
    });
  } else {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "REFUSEE", decidedById: session.user.id, decidedAt: new Date() },
    });
  }

  await logAction("UPDATE", "ORDER", orderId);
  await notifyDiscord(
    `Commande ${approve ? "approuvee" : "refusee"} : ${order.quantity} x ${order.catalogItem.name}`,
  );

  revalidatePath("/commandes");
  revalidatePath("/inventaire");
}
