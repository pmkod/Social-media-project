import { expect, test } from "bun:test";
import { parseVideoRange } from "./video-range";

test("handles initial probes, seeking, open-ended and suffix byte ranges", () => {
	expect(parseVideoRange("bytes=0-1", 100)).toEqual({ start: 0, end: 1 });
	expect(parseVideoRange("bytes=20-", 100)).toEqual({ start: 20, end: 99 });
	expect(parseVideoRange("bytes=-10", 100)).toEqual({ start: 90, end: 99 });
	expect(parseVideoRange("bytes=-200", 100)).toEqual({ start: 0, end: 99 });
	expect(parseVideoRange("bytes=50-200", 100)).toEqual({ start: 50, end: 99 });
});
test("rejects invalid and unsatisfiable ranges", () => {
	for (const value of [
		"bytes=100-",
		"bytes=2-1",
		"bytes=-0",
		"bytes=-",
		"bytes=0-1,4-5",
		"bytes=nope-2",
		"bytes=0-9007199254740992",
	])
		expect(parseVideoRange(value, 100)).toBeNull();
	expect(parseVideoRange("bytes=0-1", 0)).toBeNull();
});
