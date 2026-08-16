import { describe, expect, it } from "bun:test";
import { likePostApi, useLikePost } from "./use-like-post.ts";

describe("useLikePost", () => {
	it("should export useLikePost function and likePostApi", () => {
		expect(typeof useLikePost).toBe("function");
		expect(typeof likePostApi).toBe("function");
	});
});
