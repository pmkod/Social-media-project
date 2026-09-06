import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const generateSessionToken = () => randomBytes(48).toString("base64url");

const hashSessionToken = (token: string) =>
	createHash("sha256").update(token).digest("hex");

const sessionTokenMatchesHash = (token: string, expectedHash: string) => {
	const actual = Buffer.from(hashSessionToken(token), "hex");
	const expected = Buffer.from(expectedHash, "hex");

	return actual.length === expected.length && timingSafeEqual(actual, expected);
};

export { generateSessionToken, hashSessionToken, sessionTokenMatchesHash };
