import { Config } from "../config";
import { logger } from "./logger";

const avatarSvg = (seed: string, color: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${color}"/>
  <circle cx="100" cy="80" r="40" fill="rgba(255,255,255,0.9)"/>
  <path d="M40,180 Q100,120 160,180" fill="rgba(255,255,255,0.9)"/>
  <text x="100" y="185" font-size="12" text-anchor="middle" fill="rgba(255,255,255,0.7)">${seed.slice(0, 8)}</text>
</svg>`;

const mediaSvg = (seed: string, color: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="${color}"/>
  <rect x="100" y="100" width="600" height="400" rx="20" fill="rgba(255,255,255,0.15)"/>
  <circle cx="400" cy="300" r="80" fill="rgba(255,255,255,0.3)"/>
  <text x="400" y="540" font-size="24" text-anchor="middle" fill="rgba(255,255,255,0.8)">${seed}</text>
</svg>`;

const palette: string[] = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

const colorFromSeed = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  const color = palette[index];
  if (color === undefined) return palette[0] ?? "#3b82f6";
  return color;
};

const svgToBase64DataUri = (svg: string): string => {
  const base64 = Buffer.from(svg.trim()).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
};

const writeFileIfConfigured = async (filename: string, content: string): Promise<string | null> => {
  if (!Config.mediaOutputDir) return null;

  const dir = `${Config.mediaOutputDir}`;
  await Bun.write(`${dir}/${filename}`, content);
  return `${Config.mediaBaseUrl}/${filename}`;
};

const generateAvatar = async (userId: string): Promise<string> => {
  const color = colorFromSeed(userId);
  const svg = avatarSvg(userId, color);
  const filename = `avatar-${userId}.svg`;

  const fileUrl = await writeFileIfConfigured(filename, svg);
  if (fileUrl) {
    logger.info(`Avatar written to disk: ${fileUrl}`);
    return fileUrl;
  }

  return svgToBase64DataUri(svg);
};

const generateMedia = async (postId: string, index: number): Promise<string> => {
  const seed = `post-${postId}-media-${index}`;
  const color = colorFromSeed(seed);
  const svg = mediaSvg(seed, color);
  const filename = `media-${postId}-${index}.svg`;

  const fileUrl = await writeFileIfConfigured(filename, svg);
  if (fileUrl) {
    logger.info(`Media written to disk: ${fileUrl}`);
    return fileUrl;
  }

  return svgToBase64DataUri(svg);
};

export { generateAvatar, generateMedia };
