import { describe, expect, test } from "bun:test";
import { ExceptionCodes } from "./exceptions/exception.codes";
import { app } from "./index";

describe("internal routes", () => {
	test.each([
		["GET", "/internal"],
		["POST", "/internal/session/create-session"],
		["OPTIONS", "/internal/user/get-active-users-batch"],
	])("returns 404 for %s %s", async (method, pathname) => {
		const response = await app.request(pathname, { method });

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({
			error: {
				message: "Route not found in API Gateway",
				code: ExceptionCodes.something_went_wrong,
			},
		});
	});
});
