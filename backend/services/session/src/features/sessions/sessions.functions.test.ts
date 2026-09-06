import { describe, expect, test } from "bun:test";
import {
	generateSessionToken,
	hashSessionToken,
	sessionTokenMatchesHash,
} from "./sessions.functions";

describe("session token functions", () => {
	test("generates distinct 384-bit URL-safe tokens", () => {
		const firstToken = generateSessionToken();
		const secondToken = generateSessionToken();

		expect(firstToken).toHaveLength(64);
		expect(firstToken).toMatch(/^[A-Za-z0-9_-]+$/);
		expect(firstToken).not.toBe(secondToken);
	});

	test("stores and compares only a SHA-256 token hash", () => {
		const token = generateSessionToken();
		const tokenHash = hashSessionToken(token);

		expect(tokenHash).toHaveLength(64);
		expect(tokenHash).not.toBe(token);
		expect(sessionTokenMatchesHash(token, tokenHash)).toBe(true);
		expect(sessionTokenMatchesHash("invalid-token", tokenHash)).toBe(false);
	});
});
