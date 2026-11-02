import { LoginForm } from "@/components/forms/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-panel p-8">
        <p className="font-display text-xl tracking-widest text-accent">BLACKBOOK</p>
        <p className="mt-2 text-sm text-muted">
          Carnet personnel confidentiel. Acces reserve — usage prive, hors-RP.
        </p>
        <div className="mt-6">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </main>
  );
}
