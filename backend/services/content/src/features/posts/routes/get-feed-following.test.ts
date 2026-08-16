import { describe, expect, it } from "bun:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import { getFeedFollowingRoute } from "./get-feed-following.route";
import { likePostRoute } from "./like-post.route";
import { unlikePostRoute } from "./unlike-post.route";

describe("Following Feed & Likes", () => {
	const app = new OpenAPIHono();
	app.openapiRoutes([getFeedFollowingRoute, likePostRoute, unlikePostRoute]);

	it("should paginate through following feed using direct cursorId and cursorCreatedAt", async () => {
		// 1. Fetch first page
		const page1Response = await app.request("/feed/following?limit=2");
		expect(page1Response.status).toBe(200);

		const page1Json = (await page1Response.json()) as any;
		expect(Array.isArray(page1Json.posts)).toBe(true);

		for (const post of page1Json.posts) {
			expect(typeof post.likesCount).toBe("number");
			expect(typeof post.isLikedByAuthenticatedUser).toBe("boolean");
			expect(post.isLikedByAuthenticatedUser).toBe(false);
		}

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

	it("should like and unlike a post using POST and DELETE /posts/:postId/likes and update feed isLikedByAuthenticatedUser", async () => {
		const feedResponse = await app.request("/feed/following?limit=1");
		const feedJson = (await feedResponse.json()) as any;
		if (feedJson.posts.length > 0) {
			const targetPost = feedJson.posts[0];
			const testUserId = "test-user-like-suite";

			// 1. Like the post via POST /posts/:postId/likes
			const likeResponse = await app.request(`/posts/${targetPost.id}/likes`, {
				method: "POST",
				headers: {
					"X-Authenticated-User-Id": testUserId,
				},
			});
			expect(likeResponse.status).toBe(201);
			const likeJson = (await likeResponse.json()) as any;
			expect(likeJson.success).toBe(true);
			expect(typeof likeJson.likesCount).toBe("number");

			// 2. Feed with X-Authenticated-User-Id should now return isLikedByAuthenticatedUser = true
			const authFeedResponse = await app.request("/feed/following?limit=10", {
				headers: {
					"X-Authenticated-User-Id": testUserId,
				},
			});
			const authFeedJson = (await authFeedResponse.json()) as any;
			const postInFeed = authFeedJson.posts.find((p: any) => p.id === targetPost.id);
			if (postInFeed) {
				expect(postInFeed.isLikedByAuthenticatedUser).toBe(true);
				expect(postInFeed.likesCount).toBe(likeJson.likesCount);
			}

			// 3. Unlike the post via DELETE /posts/:postId/likes
			const unlikeResponse = await app.request(`/posts/${targetPost.id}/likes`, {
				method: "DELETE",
				headers: {
					"X-Authenticated-User-Id": testUserId,
				},
			});
			expect(unlikeResponse.status).toBe(200);
			const unlikeJson = (await unlikeResponse.json()) as any;
			expect(unlikeJson.success).toBe(true);

			// 4. Feed with X-Authenticated-User-Id should now return isLikedByAuthenticatedUser = false
			const unauthFeedResponse = await app.request("/feed/following?limit=10", {
				headers: {
					"X-Authenticated-User-Id": testUserId,
				},
			});
			const unauthFeedJson = (await unauthFeedResponse.json()) as any;
			const unlikedPostInFeed = unauthFeedJson.posts.find((p: any) => p.id === targetPost.id);
			if (unlikedPostInFeed) {
				expect(unlikedPostInFeed.isLikedByAuthenticatedUser).toBe(false);
			}
		}
	});
});
