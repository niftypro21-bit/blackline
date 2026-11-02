import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le client Prisma est genere hors de node_modules (src/generated/prisma) ; sans
  // cette regle, Next.js ne detecte pas le moteur Linux a inclure dans le paquet
  // deploye sur Vercel (erreur "could not locate the Query Engine").
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
