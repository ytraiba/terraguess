import { MapillaryProvider } from "./mapillary-provider";
import type { ImageryProvider } from "./types";

const providers: Record<string, () => ImageryProvider> = {
  mapillary: () => new MapillaryProvider(),
};

export function getImageryProvider(
  name: string = "mapillary"
): ImageryProvider {
  const factory = providers[name];
  if (!factory) throw new Error(`Unknown imagery provider: ${name}`);
  return factory();
}
