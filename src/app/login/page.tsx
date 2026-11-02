import { LoginForm } from "@/components/forms/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-accent/30 bg-panel p-8 shadow-glow">
        <p className="font-display text-xl tracking-widest text-accent glow-text">BLACKLINE</p>
        <p className="mt-2 text-sm text-muted">
          Tablette privee — acces reserve aux membres de la communaute. Donnees fictives, usage RP
          uniquement.
        </p>
        <div className="mt-6">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </main>
  );
}
