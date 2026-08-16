import { describe, expect, it } from "bun:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import { getFeedFollowingRoute } from "./get-feed-following.route";

describe("Following Feed Direct Cursor Pagination", () => {
	const app = new OpenAPIHono();
	app.openapiRoutes([getFeedFollowingRoute]);

	it("should paginate through following feed using direct cursorId and cursorCreatedAt", async () => {
		// 1. Fetch first page
		const page1Response = await app.request("/feed/following?limit=2");
		expect(page1Response.status).toBe(200);

		const page1Json = (await page1Response.json()) as any;
		expect(Array.isArray(page1Json.posts)).toBe(true);

		if (page1Json.posts.length === 2 && page1Json.pagination.hasNextPage) {
			const cursor = page1Json.pagination.nextCursor;
			expect(cursor).toBeDefined();
			expect(typeof cursor.id).toBe("string");
			expect(typeof cursor.createdAt).toBe("string");

			// 2. Fetch second page with direct cursor properties
			const page2Response = await app.request(
				`/feed/following?cursorId=${cursor.id}&cursorCreatedAt=${encodeURIComponent(cursor.createdAt)}&limit=2`,
			);
			expect(page2Response.status).toBe(200);

			const page2Json = (await page2Response.json()) as any;
			expect(Array.isArray(page2Json.posts)).toBe(true);

			// Ensure page 2 posts don't overlap with page 1 posts
			const page1Ids = page1Json.posts.map((p: any) => p.id);
			for (const post of page2Json.posts) {
				expect(page1Ids).not.toContain(post.id);
			}
		}
	});

	it("should handle request with non-existent / boundary cursor gracefully", async () => {
		const pastDate = new Date("2000-01-01T00:00:00.000Z").toISOString();
		const response = await app.request(
			`/feed/following?cursorId=non-existent-id&cursorCreatedAt=${encodeURIComponent(pastDate)}&limit=10`,
		);
		expect(response.status).toBe(200);

		const json = (await response.json()) as any;
		expect(json.posts).toEqual([]);
		expect(json.pagination.hasNextPage).toBe(false);
		expect(json.pagination.nextCursor).toBeNull();
	});
});
