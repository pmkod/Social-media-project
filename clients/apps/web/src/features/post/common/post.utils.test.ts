import { describe, expect, it } from "bun:test";
import {
	formatCommentCreationDate,
	formatPostCreationDate,
	formatPostFullDate,
} from "./post.utils";

describe("Post Date Utils", () => {
	it("should format recent dates as 'À l'instant'", () => {
		const now = new Date();
		expect(formatPostCreationDate(now.toISOString())).toBe("À l'instant");
		expect(formatCommentCreationDate(now.toISOString())).toBe("À l'instant");
	});

	it("should format minutes correctly", () => {
		const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
		expect(formatPostCreationDate(fiveMinutesAgo.toISOString())).toBe("5 min");
	});

	it("should format hours correctly", () => {
		const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
		expect(formatPostCreationDate(twoHoursAgo.toISOString())).toBe("2 h");
	});

	it("should format days correctly", () => {
		const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
		expect(formatPostCreationDate(threeDaysAgo.toISOString())).toBe("3 j");
	});

	it("should handle empty or null values gracefully", () => {
		expect(formatPostCreationDate(null)).toBe("");
		expect(formatPostCreationDate(undefined)).toBe("");
		expect(formatPostFullDate(null)).toBe("");
	});

	it("should format full date nicely", () => {
		const testDate = new Date("2026-08-16T10:30:00.000Z");
		const fullFormatted = formatPostFullDate(testDate.toISOString());
		expect(fullFormatted.length).toBeGreaterThan(0);
		expect(fullFormatted).toContain("2026");
	});
});
