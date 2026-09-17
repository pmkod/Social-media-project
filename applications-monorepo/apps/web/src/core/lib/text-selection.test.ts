import { describe, expect, it } from "vitest";
import { insertTextAtSelection } from "./text-selection.ts";

describe("insertTextAtSelection", () => {
	it("inserts an emoji at the caret", () => {
		expect(
			insertTextAtSelection("Hello world", "👋", { start: 6, end: 6 }),
		).toEqual({
			value: "Hello 👋world",
			caret: 8,
		});
	});

	it("replaces the selected text", () => {
		expect(
			insertTextAtSelection("Hello world", "🌍", { start: 6, end: 11 }),
		).toEqual({
			value: "Hello 🌍",
			caret: 8,
		});
	});

	it("appends when no selection is provided", () => {
		expect(insertTextAtSelection("Hello", " 😊")).toEqual({
			value: "Hello 😊",
			caret: 8,
		});
	});

	it("does not split an emoji to satisfy the maximum length", () => {
		expect(
			insertTextAtSelection("1234", "👋", { start: 4, end: 4 }, 5),
		).toBeNull();
	});
});
