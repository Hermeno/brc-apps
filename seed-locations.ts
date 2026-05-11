import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Criando profissionais adicionais...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Profissional de Oklahoma
  const cleanerOK = await prisma.user.create({
    data: {
      email: "carlos.oklahoma@example.com",
      password: hashedPassword,
      name: "Carlos Lima",
      role: "CLEANER",
      isVerified: true,
      phone: "(405) 555-0123",
      address: "123 Main Street, Oklahoma City, OK",
      zipCode: "73102",
      bio: "Profissional experiente em limpeza residencial e comercial. 8 anos de experiência em Oklahoma.",
      pricePerHour: 45,
      serviceTypes: ["residential_cleaning", "office_cleaning", "deep_cleaning"],
      isAvailable: true,
      plan: "PREMIUM",
      latitude: 35.4676,
      longitude: -97.5164,
    },
  });

  console.log("✅ Profissional Oklahoma criado:", cleanerOK.email);

  // Profissional de Nova York
  const cleanerNY = await prisma.user.create({
    data: {
      email: "sarah.newyork@example.com",
      password: hashedPassword,
      name: "Sarah Johnson",
      role: "CLEANER",
      isVerified: true,
      phone: "(212) 555-0456",
      address: "456 5th Avenue, New York, NY",
      zipCode: "10022",
      bio: "Especialista em limpeza premium para apartamentos de luxo em Manhattan. Certificada e assegurada.",
      pricePerHour: 75,
      serviceTypes: ["residential_cleaning", "office_cleaning", "window_cleaning"],
      isAvailable: true,
      plan: "PRO",
      latitude: 40.7128,
      longitude: -74.006,
    },
  });

  console.log("✅ Profissional Nova York criado:", cleanerNY.email);

  console.log("\n🎉 Profissionais adicionados com sucesso!");
  console.log("\n📝 Novos profissionais:");
  console.log("  Oklahoma: carlos.oklahoma@example.com (R$ 45/hora) - PREMIUM");
  console.log("  Nova York: sarah.newyork@example.com (R$ 75/hora) - PRO");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
