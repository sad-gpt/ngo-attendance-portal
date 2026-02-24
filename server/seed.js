import bcrypt from "bcryptjs";
import prisma from "./config/prisma.js";

async function main() {
  const password = bcrypt.hashSync("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@ngo.com" },
    update: {},
    create: { name: "Admin", email: "admin@ngo.com", password, role: "admin" },
  });

  for (const s of [
    { name: "Priya Sharma", age: 32, email: "priya@ngo.com" },
    { name: "Rahul Verma", age: 28, email: "rahul@ngo.com" },
    { name: "Anita Singh", age: 35, email: "anita@ngo.com" },
  ]) {
    await prisma.staff.upsert({ where: { email: s.email }, update: {}, create: s });
  }

  console.log("Seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
