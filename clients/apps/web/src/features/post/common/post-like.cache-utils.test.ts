import { describe, expect, it } from "bun:test";
import {
	updatePostInQueryData,
	updatePostLikeState,
} from "./post-like.cache-utils.ts";
import type { Post } from "./post.ts";

describe("Like / Unlike Cache Helpers", () => {
	const samplePost: Post = {
		id: "post-1",
		createdAt: "2026-08-16T12:00:00.000Z",
		likesCount: 5,
		isLikedByAuthenticatedUser: false,
		isLiked: false,
	};

	it("updatePostLikeState should properly like a post", () => {
		const updated = updatePostLikeState(samplePost, true);
		expect(updated.isLikedByAuthenticatedUser).toBe(true);
		expect(updated.isLiked).toBe(true);
		expect(updated.likesCount).toBe(6);
	});

	it("updatePostLikeState should properly unlike a post", () => {
		const likedPost: Post = {
			...samplePost,
			isLikedByAuthenticatedUser: true,
			isLiked: true,
			likesCount: 6,
		};
		const updated = updatePostLikeState(likedPost, false);
		expect(updated.isLikedByAuthenticatedUser).toBe(false);
		expect(updated.isLiked).toBe(false);
		expect(updated.likesCount).toBe(5);
	});

	it("updatePostLikeState should accept an explicit likesCount from server response", () => {
		const updated = updatePostLikeState(samplePost, true, 42);
		expect(updated.likesCount).toBe(42);
		expect(updated.isLikedByAuthenticatedUser).toBe(true);
	});

	it("updatePostInQueryData should update infinite query cache (pages format)", () => {
		const infiniteData = {
			pages: [
				{
					posts: [
						samplePost,
						{ id: "post-2", createdAt: "2026-08-16", likesCount: 0 },
					],
					pagination: { nextCursor: null, hasNextPage: false, limit: 10 },
				},
			],
			pageParams: [null],
		};

		const updatedData = updatePostInQueryData(
			infiniteData,
			"post-1",
			true,
		) as typeof infiniteData;

		expect(updatedData.pages[0].posts[0].isLikedByAuthenticatedUser).toBe(true);
		expect(updatedData.pages[0].posts[0].likesCount).toBe(6);
		expect(updatedData.pages[0].posts[1].likesCount).toBe(0);
	});

	it("updatePostInQueryData should update simple posts object cache", () => {
		const data = {
			posts: [samplePost],
		};

		const updatedData = updatePostInQueryData(
			data,
			"post-1",
			true,
		) as typeof data;

		expect(updatedData.posts[0].isLikedByAuthenticatedUser).toBe(true);
		expect(updatedData.posts[0].likesCount).toBe(6);
	});

	it("updatePostInQueryData should update simple array cache", () => {
		const data = [samplePost];

		const updatedData = updatePostInQueryData(
			data,
			"post-1",
			true,
		) as Post[];

		expect(updatedData[0].isLikedByAuthenticatedUser).toBe(true);
		expect(updatedData[0].likesCount).toBe(6);
	});
});
