import { describe, expect, test } from "bun:test";
import { uniqueValues } from "./collection.functions";

describe("uniqueValues", () => {
	test("keeps the first occurrence of each value", () => {
		expect(uniqueValues(["a", "b", "a", "c", "b"])).toEqual([
			"a",
			"b",
			"c",
		]);
	});
});
