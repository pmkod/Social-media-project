import { describe, expect, it } from "bun:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import { getUsersBatchRoute } from "./get-users-batch.route";

describe("User Batch Route", () => {
	const app = new OpenAPIHono();
	app.openapiRoutes([getUsersBatchRoute]);

	it("should handle empty or non-matching batch gracefully", async () => {
		const response = await app.request("/users/batch", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				userIds: ["non-existent-user-1", "non-existent-user-2"],
			}),
		});

		expect(response.status).toBe(200);
		const json = (await response.json()) as any;
		expect(Array.isArray(json)).toBe(true);
		expect(json.length).toBe(0);
	});

	it("should reject invalid request payload with missing userIds", async () => {
		const response = await app.request("/users/batch", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		});

		expect(response.status).toBe(400);
	});
});
