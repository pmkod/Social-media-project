function getEnv(name: string): string;
function getEnv(name: string, defaultValue: string): string;
function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const getEnvNumber = (name: string, defaultValue: number): number => {
  const value = process.env[name];
  if (value === undefined || value === "") return defaultValue;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) throw new Error(`Invalid number environment variable: ${name}`);
  return parsed;
};

const getEnvBoolean = (name: string, defaultValue: boolean): boolean => {
  const value = process.env[name];
  if (value === undefined || value === "") return defaultValue;
  return value === "true" || value === "1";
};

type ConfigType = {
  nodeEnv: string;
  userDatabaseUrl: string;
  contentDatabaseUrl: string;
  useApi: boolean;
  gatewayBaseUrl: string;
  accessTokenSecretKey: string;
  accessTokenExpirationSec: number;
  seedUserCount: number;
  seedPostsPerUser: number;
  seedCommentsPerPost: number;
  seedLikeProbability: number;
  mediaOutputDir: string;
  mediaBaseUrl: string;
};

const Config: ConfigType = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  userDatabaseUrl: getEnv("USER_DATABASE_URL"),
  contentDatabaseUrl: getEnv("CONTENT_DATABASE_URL"),

  useApi: getEnvBoolean("USE_API", false),
  gatewayBaseUrl: getEnv("GATEWAY_BASE_URL", "http://localhost:8000"),
  accessTokenSecretKey: getEnv("ACCESS_TOKEN_SECRET_KEY", "super-secret-access-key-social-media-2026"),
  accessTokenExpirationSec: getEnvNumber("ACCESS_TOKEN_EXPIRATION_SEC", 900),

  seedUserCount: getEnvNumber("SEED_USER_COUNT", 10),
  seedPostsPerUser: getEnvNumber("SEED_POSTS_PER_USER", 3),
  seedCommentsPerPost: getEnvNumber("SEED_COMMENTS_PER_POST", 2),
  seedLikeProbability: getEnvNumber("SEED_LIKE_PROBABILITY", 30) / 100,

  mediaOutputDir: getEnv("MEDIA_OUTPUT_DIR", ""),
  mediaBaseUrl: getEnv("MEDIA_BASE_URL", "http://localhost:8000/media").replace(/\/$/, ""),
};

export { Config };
export type { ConfigType };
