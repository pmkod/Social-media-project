import { describe, expect, it } from "bun:test";
import { unlikePostApi, useUnlikePost } from "./use-unlike-post.ts";

describe("useUnlikePost", () => {
	it("should export useUnlikePost function and unlikePostApi", () => {
		expect(typeof useUnlikePost).toBe("function");
		expect(typeof unlikePostApi).toBe("function");
	});
});
