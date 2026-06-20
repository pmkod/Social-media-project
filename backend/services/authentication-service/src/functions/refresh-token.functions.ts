import { createHash, randomBytes } from "node:crypto";

export function generateRefreshTokenString(): string {
	return randomBytes(64).toString("hex");
}

export function hashRefreshToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}
