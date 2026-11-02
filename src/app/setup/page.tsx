import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SetupForm } from "@/components/forms/SetupForm";

export default async function SetupPage() {
  const existingCount = await prisma.user.count();
  if (existingCount > 0) redirect("/login");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-accent/30 bg-panel p-8 shadow-glow">
        <p className="font-display text-xl tracking-widest text-accent glow-text">BLACKLINE</p>
        <p className="mt-2 text-sm text-muted">
          Premier lancement. Creez le compte proprietaire — aucun identifiant par defaut n&apos;existe
          sur ce site.
        </p>
        <div className="mt-6">
          <SetupForm />
        </div>
      </div>
    </main>
  );
}
