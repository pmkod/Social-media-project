import { generateUserData, predefinedUserData } from "../lib/faker";
import { generateAvatar } from "../lib/files";
import { getUserPrisma } from "../lib/database";
import { logger } from "../lib/logger";
import { Config } from "../config";

const hashAlgorithm = "argon2id";

const hashPassword = (password: string) => {
  return Bun.password.hash(password, { algorithm: hashAlgorithm });
};

export type SeededUser = {
  id: string;
  email: string;
  username: string;
  password: string;
  fullName: string | null;
};

const createUser = async (
  prisma: ReturnType<typeof getUserPrisma>,
  userData: ReturnType<typeof generateUserData>,
  label: string,
): Promise<SeededUser> => {
  const avatarUrl = await generateAvatar(userData.email);
  const { password, ...rest } = userData;
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      ...rest,
      password: hashedPassword,
      avatarUrl,
    },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      fullName: true,
    },
  });

  logger.success(`Created ${label}: ${user.username} (${user.email}) - id: ${user.id}`);
  return user;
};

const seedUsers = async (): Promise<SeededUser[]> => {
  const prisma = getUserPrisma();
  const count = Config.seedUserCount;

  logger.info(`Seeding ${count} generated users + 1 predefined user...`);

  const existingUserCount = await prisma.user.count();
  if (existingUserCount > 0) {
    logger.warn(`User table already contains ${existingUserCount} rows. Skipping user seeding to avoid duplicates.`);
    const existing = await prisma.user.findMany({
      select: { id: true, email: true, username: true, password: true, fullName: true },
    });
    return existing;
  }

  const seededUsers: SeededUser[] = [];

  const predefined = await createUser(prisma, predefinedUserData(), "predefined user");
  seededUsers.push(predefined);

  for (let i = 0; i < count; i++) {
    const user = await createUser(prisma, generateUserData(i), `user #${i + 1}`);
    seededUsers.push(user);
  }

  logger.success(`Seeded ${seededUsers.length} users.`);
  return seededUsers;
};

export { seedUsers };
