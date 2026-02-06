import { prisma } from "@/lib/db";
import type { ImageryProvider, PanoramaLocation } from "./types";

export class MapillaryProvider implements ImageryProvider {
  readonly name = "mapillary";

  async getRandomLocations(count: number): Promise<PanoramaLocation[]> {
    // Get distinct regions for geographic diversity
    const regions = await prisma.location.findMany({
      where: { provider: "mapillary", verified: true },
      select: { region: true },
      distinct: ["region"],
    });

    const regionNames = regions
      .map((r) => r.region)
      .filter(Boolean) as string[];

    if (regionNames.length === 0) {
      throw new Error("No locations available in database");
    }

    const selected: PanoramaLocation[] = [];
    const usedIds = new Set<string>();

    // Shuffle regions
    const shuffled = [...regionNames].sort(() => Math.random() - 0.5);
    const locationsPerRegion = Math.ceil(count / shuffled.length);

    for (const region of shuffled) {
      if (selected.length >= count) break;

      const candidates = await prisma.location.findMany({
        where: { provider: "mapillary", region, verified: true },
      });

      const shuffledCandidates = [...candidates].sort(
        () => Math.random() - 0.5
      );
      const take = Math.min(locationsPerRegion, count - selected.length);

      for (let i = 0; i < take && i < shuffledCandidates.length; i++) {
        const loc = shuffledCandidates[i];
        if (usedIds.has(loc.id)) continue;
        usedIds.add(loc.id);
        selected.push({
          lat: loc.lat,
          lng: loc.lng,
          imageId: loc.imageId,
          provider: "mapillary",
        });
      }
    }

    // If still need more, fill with any remaining locations
    if (selected.length < count) {
      const remaining = await prisma.location.findMany({
        where: {
          provider: "mapillary",
          verified: true,
          id: { notIn: Array.from(usedIds) },
        },
      });
      const shuffledRemaining = [...remaining].sort(
        () => Math.random() - 0.5
      );
      for (
        let i = 0;
        i < shuffledRemaining.length && selected.length < count;
        i++
      ) {
        const loc = shuffledRemaining[i];
        selected.push({
          lat: loc.lat,
          lng: loc.lng,
          imageId: loc.imageId,
          provider: "mapillary",
        });
      }
    }

    return selected.sort(() => Math.random() - 0.5);
  }

  async validateImageId(imageId: string): Promise<boolean> {
    const token = process.env.MAPILLARY_ACCESS_TOKEN;
    if (!token) return false;

    try {
      const res = await fetch(
        `https://graph.mapillary.com/${imageId}?access_token=${token}&fields=id`
      );
      return res.ok;
    } catch {
      return false;
    }
  }
}
