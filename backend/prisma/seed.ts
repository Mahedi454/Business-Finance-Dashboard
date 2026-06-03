import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEMO_ADMIN_EMAIL ?? "admin@finance.com";
  const password = process.env.DEMO_ADMIN_PASSWORD ?? "admin1234";

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: await bcrypt.hash(password, 10) },
    create: {
      name: "Business Finance Admin",
      email,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
