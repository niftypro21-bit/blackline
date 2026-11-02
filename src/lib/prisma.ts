import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// En local (ou sur un hebergeur avec disque persistant comme Railway/Render), on
// utilise le fichier SQLite directement. Sur Vercel (pas de disque persistant),
// TURSO_DATABASE_URL pointe vers une base Turso hebergee, compatible SQLite.
const adapter = process.env.TURSO_DATABASE_URL
  ? new PrismaLibSQL({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : undefined;

export const prisma = globalForPrisma.prisma ?? new PrismaClient(adapter ? { adapter } : undefined);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
