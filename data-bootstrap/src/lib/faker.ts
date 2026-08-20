import {
  bioTemplates,
  commentContents,
  deterministicInt,
  firstNames,
  hashString,
  lastNames,
  pickByIndex,
  postContents,
} from "./static-data";

const createHandle = (base: string): string => {
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return sanitized;
};

const generateUserData = (index: number) => {
  const firstName = pickByIndex(firstNames, index);
  const lastName = pickByIndex(lastNames, index);
  const fullName = `${firstName} ${lastName}`;
  const username = createHandle(`${firstName}_${lastName}_${index}`);
  const email = `seed.${index}.${username}@example.local`;
  const password = `SeedPassword${index}!${1000 + (index % 9000)}`;

  const bio = index % 3 === 0 ? pickByIndex(bioTemplates, index) : null;

  return {
    email,
    username,
    password,
    fullName,
    bio,
    emailVerified: true,
    active: true,
  };
};

const generatePostContent = (index: number): string => {
  return pickByIndex(postContents, index);
};

const generateCommentContent = (index: number): string => {
  return pickByIndex(commentContents, index);
};

/** Sélectionne un sous-ensemble déterministe d'utilisateurs pour un like. */
const pickLikers = (
  users: { id: string; username: string }[],
  postAuthorId: string,
  seed: string,
  maxRatio: number,
): { id: string; username: string }[] => {
  const hash = hashString(seed);
  const maxCount = Math.max(0, Math.ceil(users.length * maxRatio));
  const count = deterministicInt(hash, 0, maxCount);

  const start = Math.abs(hash) % Math.max(1, users.length);
  const likers: { id: string; username: string }[] = [];

  for (let i = 0; i < count; i++) {
    const user = users[(start + i) % users.length];
    if (user && user.id !== postAuthorId) {
      likers.push(user);
    }
  }

  return likers;
};

const predefinedUserData = () => ({
  email: "pierremariekod@gmail.com",
  username: "pmkd",
  password: "pierremariekod@gmail.com",
  fullName: "Kouassi Kodossou",
  bio: null as string | null,
  emailVerified: true,
  active: true,
});

export { createHandle, generateUserData, generatePostContent, generateCommentContent, pickLikers, predefinedUserData };
