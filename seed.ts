import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Criando contas de teste...");

  // Limpar dados existentes (em cascata)
  await prisma.notification.deleteMany();
  await prisma.workPhoto.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.leadDistribution.deleteMany();
  await prisma.cleanerStats.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();

  // Senha: "password123"
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Conta Cliente
  const client = await prisma.user.create({
    data: {
      email: "cliente@example.com",
      password: hashedPassword,
      name: "João Cliente",
      role: "CLIENT",
      isVerified: true,
      phone: "(11) 98765-4321",
      address: "Rua das Flores, 123, São Paulo, SP",
    },
  });

  console.log("✅ Cliente criado:", client.email);

  // Conta Profissional (Cleaner)
  const cleaner = await prisma.user.create({
    data: {
      email: "profissional@example.com",
      password: hashedPassword,
      name: "Maria Profissional",
      role: "CLEANER",
      isVerified: true,
      phone: "(11) 99876-5432",
      address: "Avenida Paulista, 1000, São Paulo, SP",
      zipCode: "01311-100",
      bio: "Profissional com 5 anos de experiência",
      pricePerHour: 50,
      serviceTypes: ["residential_cleaning", "office_cleaning"],
      isAvailable: true,
      plan: "BASIC",
    },
  });

  console.log("✅ Profissional criado:", cleaner.email);

  console.log("\n🎉 Banco de dados resetado com sucesso!");
  console.log("\n📝 Contas criadas:");
  console.log(
    "  Cliente: cliente@example.com / password123 (verificado ✓)"
  );
  console.log(
    "  Profissional: profissional@example.com / password123 (verificado ✓)"
  );
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
