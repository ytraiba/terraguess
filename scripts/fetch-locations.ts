import "dotenv/config";
import { writeFileSync } from "fs";
import { resolve } from "path";

const TOKEN = process.env.MAPILLARY_ACCESS_TOKEN;

if (!TOKEN) {
  console.error("Missing MAPILLARY_ACCESS_TOKEN in .env");
  process.exit(1);
}

// Extensive list of sample points for comprehensive global coverage
// Format: [lon, lat, region]
const SAMPLE_POINTS: [number, number, string][] = [
  // ==================== EUROPE ====================
  // Western Europe
  [2.35, 48.85, "europe"], // Paris, France
  [2.29, 48.86, "europe"], // Paris Eiffel
  [2.34, 48.88, "europe"], // Montmartre, Paris
  [-0.12, 51.51, "europe"], // London, UK
  [-0.08, 51.50, "europe"], // London alt
  [-0.14, 51.49, "europe"], // Westminster
  [4.9, 52.37, "europe"], // Amsterdam, Netherlands
  [4.88, 52.36, "europe"], // Amsterdam alt
  [4.35, 50.85, "europe"], // Brussels, Belgium
  [2.17, 41.39, "europe"], // Barcelona, Spain
  [-3.70, 40.42, "europe"], // Madrid, Spain
  [-9.14, 38.72, "europe"], // Lisbon, Portugal

  // Central Europe
  [13.4, 52.52, "europe"], // Berlin, Germany
  [13.38, 52.50, "europe"], // Berlin alt
  [11.58, 48.14, "europe"], // Munich, Germany
  [9.18, 48.78, "europe"], // Stuttgart, Germany
  [6.96, 50.94, "europe"], // Cologne, Germany
  [8.68, 50.11, "europe"], // Frankfurt, Germany
  [16.37, 48.21, "europe"], // Vienna, Austria
  [14.42, 50.08, "europe"], // Prague, Czechia
  [19.04, 47.50, "europe"], // Budapest, Hungary
  [8.54, 47.37, "europe"], // Zurich, Switzerland
  [7.45, 46.95, "europe"], // Bern, Switzerland
  [6.14, 46.20, "europe"], // Geneva, Switzerland

  // Northern Europe
  [18.07, 59.33, "europe"], // Stockholm, Sweden
  [18.05, 59.31, "europe"], // Stockholm alt
  [10.75, 59.91, "europe"], // Oslo, Norway
  [24.94, 60.17, "europe"], // Helsinki, Finland
  [12.57, 55.68, "europe"], // Copenhagen, Denmark
  [-21.89, 64.15, "europe"], // Reykjavik, Iceland

  // Southern Europe
  [12.49, 41.90, "europe"], // Rome, Italy
  [12.48, 41.89, "europe"], // Rome alt
  [11.25, 43.77, "europe"], // Florence, Italy
  [9.19, 45.46, "europe"], // Milan, Italy
  [12.33, 45.44, "europe"], // Venice, Italy
  [14.51, 35.90, "europe"], // Malta
  [23.73, 37.98, "europe"], // Athens, Greece
  [25.14, 35.34, "europe"], // Crete, Greece

  // Eastern Europe
  [21.01, 52.23, "europe"], // Warsaw, Poland
  [19.94, 50.06, "europe"], // Krakow, Poland
  [30.52, 50.45, "europe"], // Kyiv, Ukraine
  [24.03, 49.84, "europe"], // Lviv, Ukraine
  [26.10, 44.43, "europe"], // Bucharest, Romania
  [23.32, 42.70, "europe"], // Sofia, Bulgaria
  [20.46, 44.82, "europe"], // Belgrade, Serbia
  [15.98, 45.81, "europe"], // Zagreb, Croatia
  [14.51, 46.06, "europe"], // Ljubljana, Slovenia

  // ==================== NORTH AMERICA ====================
  // USA - East Coast
  [-74.00, 40.71, "north-america"], // New York City
  [-73.98, 40.75, "north-america"], // NYC Midtown
  [-73.97, 40.78, "north-america"], // Central Park
  [-71.06, 42.36, "north-america"], // Boston
  [-77.04, 38.91, "north-america"], // Washington DC
  [-75.16, 39.95, "north-america"], // Philadelphia
  [-80.19, 25.76, "north-america"], // Miami
  [-81.66, 30.33, "north-america"], // Jacksonville
  [-84.39, 33.75, "north-america"], // Atlanta
  [-78.64, 35.78, "north-america"], // Raleigh

  // USA - West Coast
  [-122.42, 37.77, "north-america"], // San Francisco
  [-122.40, 37.79, "north-america"], // SF Financial District
  [-118.24, 34.05, "north-america"], // Los Angeles
  [-118.40, 34.07, "north-america"], // Hollywood
  [-117.16, 32.72, "north-america"], // San Diego
  [-122.33, 47.61, "north-america"], // Seattle
  [-122.67, 45.51, "north-america"], // Portland
  [-115.17, 36.17, "north-america"], // Las Vegas
  [-112.07, 33.45, "north-america"], // Phoenix

  // USA - Midwest & Central
  [-87.63, 41.88, "north-america"], // Chicago
  [-87.65, 41.90, "north-america"], // Chicago alt
  [-93.27, 44.98, "north-america"], // Minneapolis
  [-83.05, 42.33, "north-america"], // Detroit
  [-84.51, 39.10, "north-america"], // Cincinnati
  [-81.69, 41.50, "north-america"], // Cleveland
  [-86.16, 39.77, "north-america"], // Indianapolis
  [-90.20, 38.63, "north-america"], // St. Louis
  [-94.58, 39.10, "north-america"], // Kansas City
  [-95.37, 29.76, "north-america"], // Houston
  [-96.80, 32.78, "north-america"], // Dallas
  [-97.74, 30.27, "north-america"], // Austin
  [-98.49, 29.42, "north-america"], // San Antonio
  [-104.99, 39.74, "north-america"], // Denver

  // Canada
  [-79.38, 43.65, "north-america"], // Toronto
  [-79.39, 43.64, "north-america"], // Toronto alt
  [-73.57, 45.50, "north-america"], // Montreal
  [-73.55, 45.51, "north-america"], // Montreal alt
  [-123.12, 49.28, "north-america"], // Vancouver
  [-75.70, 45.42, "north-america"], // Ottawa
  [-113.49, 53.55, "north-america"], // Edmonton
  [-114.07, 51.05, "north-america"], // Calgary
  [-63.57, 44.65, "north-america"], // Halifax
  [-66.65, 45.96, "north-america"], // Fredericton

  // Mexico
  [-99.13, 19.43, "north-america"], // Mexico City
  [-99.17, 19.42, "north-america"], // Mexico City alt
  [-103.35, 20.67, "north-america"], // Guadalajara
  [-100.39, 25.67, "north-america"], // Monterrey
  [-110.31, 24.14, "north-america"], // La Paz
  [-86.85, 21.16, "north-america"], // Cancun

  // ==================== SOUTH AMERICA ====================
  // Brazil
  [-46.63, -23.55, "south-america"], // Sao Paulo
  [-46.65, -23.54, "south-america"], // Sao Paulo alt
  [-43.17, -22.91, "south-america"], // Rio de Janeiro
  [-43.19, -22.90, "south-america"], // Rio alt
  [-38.50, -12.97, "south-america"], // Salvador
  [-47.88, -15.79, "south-america"], // Brasilia
  [-49.27, -25.43, "south-america"], // Curitiba
  [-51.23, -30.03, "south-america"], // Porto Alegre

  // Argentina
  [-58.38, -34.60, "south-america"], // Buenos Aires
  [-58.37, -34.61, "south-america"], // Buenos Aires alt
  [-64.18, -31.42, "south-america"], // Cordoba
  [-60.69, -32.95, "south-america"], // Rosario
  [-68.83, -32.89, "south-america"], // Mendoza

  // Chile
  [-70.65, -33.45, "south-america"], // Santiago
  [-70.64, -33.43, "south-america"], // Santiago alt
  [-71.25, -29.91, "south-america"], // La Serena
  [-73.05, -36.83, "south-america"], // Concepcion
  [-70.40, -23.65, "south-america"], // Antofagasta

  // Colombia
  [-74.07, 4.71, "south-america"], // Bogota
  [-74.08, 4.60, "south-america"], // Bogota alt
  [-75.57, 6.24, "south-america"], // Medellin
  [-76.53, 3.44, "south-america"], // Cali
  [-74.78, 10.96, "south-america"], // Barranquilla

  // Peru
  [-77.03, -12.05, "south-america"], // Lima
  [-77.05, -12.04, "south-america"], // Lima alt
  [-71.97, -13.53, "south-america"], // Cusco
  [-79.00, -8.11, "south-america"], // Trujillo

  // Other South America
  [-56.19, -34.90, "south-america"], // Montevideo, Uruguay
  [-57.64, -25.26, "south-america"], // Asuncion, Paraguay
  [-68.15, -16.50, "south-america"], // La Paz, Bolivia
  [-79.90, -2.19, "south-america"], // Guayaquil, Ecuador
  [-66.90, 10.50, "south-america"], // Caracas, Venezuela

  // ==================== ASIA ====================
  // Japan
  [139.69, 35.69, "asia"], // Tokyo
  [139.75, 35.68, "asia"], // Tokyo Shibuya
  [139.77, 35.71, "asia"], // Tokyo Akihabara
  [135.50, 34.69, "asia"], // Osaka
  [136.91, 35.18, "asia"], // Nagoya
  [130.40, 33.59, "asia"], // Fukuoka
  [132.46, 34.40, "asia"], // Hiroshima
  [141.35, 43.06, "asia"], // Sapporo
  [135.77, 35.01, "asia"], // Kyoto

  // South Korea
  [126.98, 37.57, "asia"], // Seoul
  [127.00, 37.56, "asia"], // Seoul alt
  [129.04, 35.18, "asia"], // Busan
  [127.39, 36.35, "asia"], // Daejeon
  [128.60, 35.87, "asia"], // Daegu

  // China
  [121.47, 31.23, "asia"], // Shanghai
  [121.48, 31.22, "asia"], // Shanghai alt
  [116.41, 39.90, "asia"], // Beijing
  [113.26, 23.13, "asia"], // Guangzhou
  [114.06, 22.54, "asia"], // Shenzhen
  [104.07, 30.67, "asia"], // Chengdu
  [120.15, 30.27, "asia"], // Hangzhou
  [118.80, 32.06, "asia"], // Nanjing
  [106.55, 29.56, "asia"], // Chongqing

  // Taiwan
  [121.56, 25.03, "asia"], // Taipei
  [120.68, 24.15, "asia"], // Taichung
  [120.30, 22.63, "asia"], // Kaohsiung

  // Hong Kong & Macau
  [114.17, 22.28, "asia"], // Hong Kong
  [114.15, 22.30, "asia"], // Hong Kong alt
  [113.54, 22.20, "asia"], // Macau

  // India
  [72.88, 19.08, "asia"], // Mumbai
  [72.87, 19.07, "asia"], // Mumbai alt
  [77.21, 28.61, "asia"], // Delhi
  [88.36, 22.57, "asia"], // Kolkata
  [77.59, 12.97, "asia"], // Bangalore
  [80.27, 13.08, "asia"], // Chennai
  [78.47, 17.38, "asia"], // Hyderabad
  [73.86, 18.52, "asia"], // Pune
  [72.57, 23.02, "asia"], // Ahmedabad
  [75.86, 26.92, "asia"], // Jaipur

  // ==================== SOUTHEAST ASIA ====================
  [103.85, 1.29, "southeast-asia"], // Singapore
  [103.86, 1.30, "southeast-asia"], // Singapore alt
  [100.50, 13.75, "southeast-asia"], // Bangkok, Thailand
  [100.52, 13.76, "southeast-asia"], // Bangkok alt
  [98.99, 18.79, "southeast-asia"], // Chiang Mai, Thailand
  [100.88, 12.93, "southeast-asia"], // Pattaya, Thailand
  [106.85, -6.21, "southeast-asia"], // Jakarta, Indonesia
  [106.84, -6.22, "southeast-asia"], // Jakarta alt
  [110.36, -7.80, "southeast-asia"], // Yogyakarta, Indonesia
  [115.17, -8.65, "southeast-asia"], // Bali, Indonesia
  [112.75, -7.25, "southeast-asia"], // Surabaya, Indonesia
  [121.0, 14.60, "southeast-asia"], // Manila, Philippines
  [121.03, 14.55, "southeast-asia"], // Manila alt
  [123.90, 10.32, "southeast-asia"], // Cebu, Philippines
  [105.85, 21.03, "southeast-asia"], // Hanoi, Vietnam
  [106.66, 10.76, "southeast-asia"], // Ho Chi Minh City, Vietnam
  [108.22, 16.07, "southeast-asia"], // Da Nang, Vietnam
  [104.92, 11.56, "southeast-asia"], // Phnom Penh, Cambodia
  [102.63, 17.97, "southeast-asia"], // Vientiane, Laos
  [96.17, 16.87, "southeast-asia"], // Yangon, Myanmar
  [101.69, 3.14, "southeast-asia"], // Kuala Lumpur, Malaysia
  [116.07, 5.98, "southeast-asia"], // Kota Kinabalu, Malaysia

  // ==================== OCEANIA ====================
  // Australia
  [151.21, -33.87, "oceania"], // Sydney
  [151.20, -33.86, "oceania"], // Sydney alt
  [144.96, -37.81, "oceania"], // Melbourne
  [144.97, -37.82, "oceania"], // Melbourne alt
  [153.03, -27.47, "oceania"], // Brisbane
  [115.86, -31.95, "oceania"], // Perth
  [138.60, -34.93, "oceania"], // Adelaide
  [149.13, -35.28, "oceania"], // Canberra
  [147.33, -42.88, "oceania"], // Hobart
  [130.84, -12.46, "oceania"], // Darwin
  [145.77, -16.92, "oceania"], // Cairns
  [153.43, -28.00, "oceania"], // Gold Coast

  // New Zealand
  [174.76, -36.85, "oceania"], // Auckland
  [174.77, -41.29, "oceania"], // Wellington
  [172.64, -43.53, "oceania"], // Christchurch
  [170.50, -45.87, "oceania"], // Dunedin
  [175.62, -40.35, "oceania"], // Palmerston North

  // Pacific Islands
  [178.44, -18.14, "oceania"], // Suva, Fiji
  [-149.57, -17.53, "oceania"], // Papeete, Tahiti
  [-171.76, -13.83, "oceania"], // Apia, Samoa

  // ==================== AFRICA ====================
  // North Africa
  [31.24, 30.04, "africa"], // Cairo, Egypt
  [31.23, 30.05, "africa"], // Cairo alt
  [29.92, 31.21, "africa"], // Alexandria, Egypt
  [10.18, 36.81, "africa"], // Tunis, Tunisia
  [-6.84, 34.02, "africa"], // Rabat, Morocco
  [-7.59, 33.59, "africa"], // Casablanca, Morocco
  [3.06, 36.75, "africa"], // Algiers, Algeria

  // West Africa
  [3.39, 6.52, "africa"], // Lagos, Nigeria
  [3.38, 6.45, "africa"], // Lagos alt
  [7.49, 9.06, "africa"], // Abuja, Nigeria
  [-0.19, 5.56, "africa"], // Accra, Ghana
  [-4.02, 5.32, "africa"], // Abidjan, Ivory Coast
  [-17.44, 14.69, "africa"], // Dakar, Senegal

  // East Africa
  [36.82, -1.29, "africa"], // Nairobi, Kenya
  [36.83, -1.28, "africa"], // Nairobi alt
  [39.28, -6.17, "africa"], // Dar es Salaam, Tanzania
  [32.58, 0.31, "africa"], // Kampala, Uganda
  [38.74, 9.01, "africa"], // Addis Ababa, Ethiopia
  [30.06, -1.94, "africa"], // Kigali, Rwanda

  // Southern Africa
  [18.42, -33.93, "africa"], // Cape Town, South Africa
  [18.43, -33.92, "africa"], // Cape Town alt
  [28.04, -26.20, "africa"], // Johannesburg, South Africa
  [31.02, -29.86, "africa"], // Durban, South Africa
  [28.28, -15.42, "africa"], // Lusaka, Zambia
  [31.05, -17.83, "africa"], // Harare, Zimbabwe
  [25.91, -24.65, "africa"], // Gaborone, Botswana
  [35.00, -15.80, "africa"], // Blantyre, Malawi

  // ==================== MIDDLE EAST ====================
  [55.27, 25.20, "middle-east"], // Dubai, UAE
  [55.30, 25.26, "middle-east"], // Dubai alt
  [54.37, 24.47, "middle-east"], // Abu Dhabi, UAE
  [51.53, 25.29, "middle-east"], // Doha, Qatar
  [47.98, 29.38, "middle-east"], // Kuwait City
  [50.58, 26.23, "middle-east"], // Manama, Bahrain
  [58.54, 23.61, "middle-east"], // Muscat, Oman
  [44.37, 33.31, "middle-east"], // Baghdad, Iraq
  [46.72, 24.69, "middle-east"], // Riyadh, Saudi Arabia
  [39.17, 21.49, "middle-east"], // Jeddah, Saudi Arabia
  [35.50, 33.89, "middle-east"], // Beirut, Lebanon
  [36.29, 33.51, "middle-east"], // Damascus, Syria
  [35.93, 31.95, "middle-east"], // Amman, Jordan
  [34.78, 32.07, "middle-east"], // Tel Aviv, Israel
  [35.22, 31.77, "middle-east"], // Jerusalem
  [29.0, 41.01, "middle-east"], // Istanbul, Turkey
  [32.86, 39.93, "middle-east"], // Ankara, Turkey
  [27.14, 38.42, "middle-east"], // Izmir, Turkey
  [44.41, 40.18, "middle-east"], // Yerevan, Armenia
  [44.79, 41.72, "middle-east"], // Tbilisi, Georgia
  [49.87, 40.41, "middle-east"], // Baku, Azerbaijan
  [51.42, 35.69, "middle-east"], // Tehran, Iran

  // ==================== CENTRAL ASIA ====================
  [69.28, 41.31, "asia"], // Tashkent, Uzbekistan
  [71.43, 51.13, "asia"], // Astana, Kazakhstan
  [76.95, 43.24, "asia"], // Almaty, Kazakhstan
  [74.59, 42.87, "asia"], // Bishkek, Kyrgyzstan
  [68.77, 38.56, "asia"], // Dushanbe, Tajikistan
  [58.38, 37.95, "asia"], // Ashgabat, Turkmenistan
  [106.91, 47.92, "asia"], // Ulaanbaatar, Mongolia
];

interface MapillaryImage {
  id: string;
  geometry: {
    coordinates: [number, number];
  };
}

interface SeedLocation {
  lat: number;
  lng: number;
  imageId: string;
  country: string;
  region: string;
}

async function fetchImagesNearPoint(
  lon: number,
  lat: number,
  region: string
): Promise<SeedLocation[]> {
  // Create a very small bounding box (about 500m x 500m)
  const delta = 0.005;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const url = `https://graph.mapillary.com/images?access_token=${TOKEN}&fields=id,geometry&bbox=${bbox}&limit=5`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      // If box still too large, try smaller
      if (text.includes("too large")) {
        const smallerDelta = 0.003;
        const smallerBbox = `${lon - smallerDelta},${lat - smallerDelta},${lon + smallerDelta},${lat + smallerDelta}`;
        const retryUrl = `https://graph.mapillary.com/images?access_token=${TOKEN}&fields=id,geometry&bbox=${smallerBbox}&limit=5`;
        const retryRes = await fetch(retryUrl);
        if (!retryRes.ok) return [];
        const retryData = await retryRes.json();
        const images: MapillaryImage[] = retryData.data || [];
        if (images.length === 0) return [];
        const picked = images[Math.floor(Math.random() * images.length)];
        const [pLng, pLat] = picked.geometry.coordinates;
        return [{ lat: pLat, lng: pLng, imageId: picked.id, country: "", region }];
      }
      return [];
    }

    const data = await res.json();
    const images: MapillaryImage[] = data.data || [];

    if (images.length === 0) return [];

    // Pick one random image from results
    const picked = images[Math.floor(Math.random() * images.length)];
    const [pLng, pLat] = picked.geometry.coordinates;

    return [
      {
        lat: pLat,
        lng: pLng,
        imageId: picked.id,
        country: "",
        region,
      },
    ];
  } catch (err) {
    console.error(`\nError fetching near ${lat},${lon}:`, err);
    return [];
  }
}

async function main() {
  console.log(`\n🌍 TerraGuess Location Fetcher`);
  console.log(`================================`);
  console.log(`Fetching images from ${SAMPLE_POINTS.length} locations worldwide...\n`);

  const allLocations: SeedLocation[] = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < SAMPLE_POINTS.length; i++) {
    const [lon, lat, region] = SAMPLE_POINTS[i];
    const locations = await fetchImagesNearPoint(lon, lat, region);

    if (locations.length > 0) {
      allLocations.push(...locations);
      successCount++;
    } else {
      failCount++;
    }

    const progress = Math.round(((i + 1) / SAMPLE_POINTS.length) * 100);
    process.stdout.write(`\r[${progress}%] Processed ${i + 1}/${SAMPLE_POINTS.length} - Found ${allLocations.length} images (${failCount} failed)`);

    // Rate limiting delay
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n\n✅ Completed! Found ${allLocations.length} valid locations out of ${SAMPLE_POINTS.length} queries`);

  if (allLocations.length === 0) {
    console.error("❌ No locations found! Check your API token.");
    process.exit(1);
  }

  // Write to seed file
  const outPath = resolve(process.cwd(), "src/data/seed-locations.json");
  writeFileSync(outPath, JSON.stringify(allLocations, null, 2));
  console.log(`\n📁 Wrote to ${outPath}`);

  // Show region distribution
  const regionCounts: Record<string, number> = {};
  for (const loc of allLocations) {
    regionCounts[loc.region] = (regionCounts[loc.region] || 0) + 1;
  }

  console.log("\n📊 Region distribution:");
  console.log("─".repeat(30));
  const sortedRegions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);
  for (const [region, count] of sortedRegions) {
    const bar = "█".repeat(Math.ceil(count / 5));
    console.log(`  ${region.padEnd(15)} ${String(count).padStart(3)} ${bar}`);
  }
  console.log("─".repeat(30));
  console.log(`  ${"TOTAL".padEnd(15)} ${String(allLocations.length).padStart(3)}`);
}

main().catch(console.error);
