import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

// Aucun compte n'est cree ici : le premier proprietaire est cree via le parcours
// securise /setup (actif uniquement quand la base ne contient encore aucun utilisateur).
// Ce seed se limite a garantir l'existence de la ligne de parametres singleton.
async function main() {
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  console.log("Parametres initialises (aucun compte de demonstration cree).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
