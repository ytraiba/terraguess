import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";

async function main() {
  const mod = await import("../src/generated/prisma/client.js");
  const { PrismaClient } = mod.default || mod;
  const { PrismaBetterSqlite3 } = await import(
    "@prisma/adapter-better-sqlite3"
  );

  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  const prisma = new PrismaClient({ adapter });

  const raw = readFileSync(
    resolve(process.cwd(), "src/data/seed-locations.json"),
    "utf-8"
  );

  interface SeedLocation {
    lat: number;
    lng: number;
    imageId: string;
    country: string;
    region: string;
  }

  const locations: SeedLocation[] = JSON.parse(raw);

  let created = 0;
  for (const loc of locations) {
    await prisma.location.upsert({
      where: { id: loc.imageId },
      update: {
        lat: loc.lat,
        lng: loc.lng,
        country: loc.country,
        region: loc.region,
      },
      create: {
        id: loc.imageId,
        lat: loc.lat,
        lng: loc.lng,
        imageId: loc.imageId,
        country: loc.country,
        region: loc.region,
        provider: "mapillary",
        verified: true,
      },
    });
    created++;
  }

  console.log(`Seeded ${created} locations`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
