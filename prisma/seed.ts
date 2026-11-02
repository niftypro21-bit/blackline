import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEFAULT_TAGS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.BLACKBOOK_OWNER_EMAIL;
  const password = process.env.BLACKBOOK_OWNER_PASSWORD;
  const name = process.env.BLACKBOOK_OWNER_NAME ?? "Owner";

  if (!email || !password) {
    throw new Error(
      "BLACKBOOK_OWNER_EMAIL et BLACKBOOK_OWNER_PASSWORD doivent etre definis dans .env avant de lancer le seed.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const owner = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "OWNER" },
    create: { name, email, passwordHash, role: "OWNER" },
  });
  console.log(`Compte OWNER pret : ${owner.email}`);

  for (const tagName of DEFAULT_TAGS) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
  }
  console.log(`${DEFAULT_TAGS.length} tags par defaut prets.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
