import { describe, expect, test } from "bun:test";
import { isInternalPath } from "./router";

describe("isInternalPath", () => {
	test.each([
		"/internal",
		"/internal/",
		"/internal/session/verify-session",
		"/internalized",
		"/%69nternal/user/get-users-batch",
		"/internal%2Fnotification/create-notification",
	])("blocks the internal namespace: %s", (pathname) => {
		expect(isInternalPath(pathname)).toBe(true);
	});

	test.each(["/", "/user/internal", "/Internal/user"])(
		"allows paths outside the internal namespace: %s",
		(pathname) => {
			expect(isInternalPath(pathname)).toBe(false);
		},
	);
});
