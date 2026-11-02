import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAccounting } from "@/lib/permissions";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser || !dbUser.isActive) redirect("/login");

  const navUser = {
    name: dbUser.name,
    isOwner: dbUser.role === "OWNER",
    showAccounting: canAccessAccounting(dbUser),
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileNav user={navUser} />
      <div className="hidden md:flex">
        <Sidebar user={navUser} />
      </div>
      <div className="flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
