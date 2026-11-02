import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canEdit, ForbiddenError } from "@/lib/permissions";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireEditableSession() {
  const session = await requireSession();
  if (!canEdit(session.user.role)) throw new ForbiddenError();
  return session;
}
