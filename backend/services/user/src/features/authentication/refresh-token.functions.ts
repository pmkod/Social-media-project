import { generateRandomString } from "@/core/functions/random.functions";

const generateRefreshTokenString = (): string => {
	return generateRandomString(64);
};

const hashRefreshToken = (token: string): string => {
	const hasher = new Bun.CryptoHasher("sha256");
	hasher.update(token);
	return hasher.digest("hex");
};

export { generateRefreshTokenString, hashRefreshToken };
