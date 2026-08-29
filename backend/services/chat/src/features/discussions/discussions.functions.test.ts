import { describe, expect, test } from "bun:test";
import { uniqueOtherUserIds } from "./discussions.functions";

describe("discussion helpers", () => {
	test("deduplicates members and removes the authenticated user", () => {
		expect(uniqueOtherUserIds(["me", "one", "one", "two"], "me")).toEqual([
			"one",
			"two",
		]);
	});
});
