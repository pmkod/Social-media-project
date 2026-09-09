import { describe, expect, it } from "vitest";
import type { Session } from "./session.ts";
import { getSessionName } from "./session.utils.ts";

const createMockSession = (userAgent: string | null): Session => ({
	id: "session-1",
	active: true,
	logoutAt: null,
	userId: "user-1",
	ipAddress: "127.0.0.1",
	userAgent,
	createdAt: "2026-09-09T00:00:00Z",
});

describe("getSessionName", () => {
	it("detects Apple mobile device", () => {
		expect(
			getSessionName(
				createMockSession(
					"Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
				),
			),
		).toBe("Apple mobile device");
		expect(
			getSessionName(
				createMockSession(
					"Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
				),
			),
		).toBe("Apple mobile device");
	});

	it("detects Android device", () => {
		expect(
			getSessionName(
				createMockSession(
					"Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36",
				),
			),
		).toBe("Android device");
	});

	it("detects browsers", () => {
		expect(
			getSessionName(
				createMockSession(
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0",
				),
			),
		).toBe("Firefox browser");
		expect(
			getSessionName(
				createMockSession(
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Edg/115.0",
				),
			),
		).toBe("Microsoft Edge browser");
		expect(
			getSessionName(
				createMockSession(
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
				),
			),
		).toBe("Chrome browser");
		expect(
			getSessionName(
				createMockSession(
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
				),
			),
		).toBe("Safari browser");
	});

	it("returns 'Unknown device' when userAgent is missing or unmapped", () => {
		expect(getSessionName(createMockSession(null))).toBe("Unknown device");
		expect(getSessionName(createMockSession("CustomClient/1.0"))).toBe(
			"Unknown device",
		);
	});
});
