import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userName = session.user.name ?? session.user.email ?? "Owner";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileNav userName={userName} />
      <div className="hidden md:flex">
        <Sidebar userName={userName} />
      </div>
      <div className="flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
