import { describe, expect, test } from "bun:test";
import { createUpstreamHeaders } from "./send";

describe("createUpstreamHeaders", () => {
	test("removes every client supplied authenticated header", () => {
		const headers = createUpstreamHeaders({
			Authorization: "Session attacker.credentials",
			"X-Authenticated-User-Id": "attacker",
			"X-Authenticated-Session-Id": "attacker-session",
			"X-Authenticated-Role": "admin",
			"Content-Type": "application/json",
		});

		expect(headers.get("Authorization")).toBeNull();
		expect(headers.get("X-Authenticated-User-Id")).toBeNull();
		expect(headers.get("X-Authenticated-Session-Id")).toBeNull();
		expect(headers.get("X-Authenticated-Role")).toBeNull();
		expect(headers.get("Content-Type")).toBe("application/json");
	});

	test("adds only the identity verified by the gateway", () => {
		const headers = createUpstreamHeaders(
			{ "X-Authenticated-User-Id": "attacker" },
			{ id: "verified-user", sessionId: "verified-session" },
		);

		expect(headers.get("X-Authenticated-User-Id")).toBe("verified-user");
		expect(headers.get("X-Authenticated-Session-Id")).toBe(
			"verified-session",
		);
	});
});
