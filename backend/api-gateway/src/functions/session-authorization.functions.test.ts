import { describe, expect, test } from "bun:test";
import { UnauthorizedException } from "../exceptions/unauthorized.exception";
import { parseSessionAuthorizationHeader } from "./session-authorization.functions";

describe("parseSessionAuthorizationHeader", () => {
	test("parses a session id and token", () => {
		expect(
			parseSessionAuthorizationHeader("Session session-id.session-token"),
		).toEqual({ sessionId: "session-id", sessionToken: "session-token" });
	});

	test.each([
		"Bearer old-jwt",
		"Session",
		"Session .token",
		"Session id.",
		"Session id token",
	])("rejects invalid credentials: %s", (authorizationHeader) => {
		expect(() => parseSessionAuthorizationHeader(authorizationHeader)).toThrow(
			UnauthorizedException,
		);
	});
});
