import { beforeEach, describe, expect, mock, test } from "bun:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";

type MockRecord = Record<string, unknown>;

const storyFindMany = mock(async (_args: unknown): Promise<MockRecord[]> => []);
const storyCreate = mock(async (args: MockRecord) => args.data ?? {});
const storyFindUnique = mock(
	async (_args: unknown): Promise<MockRecord | null> => null,
);
const storyViewFindMany = mock(
	async (_args: unknown): Promise<Array<{ storyId: string }>> => [],
);
const storyViewUpsert = mock(async (args: MockRecord) => args);
const upload = mock(async (_args: unknown) => {});
const remove = mock(async (_filename: string) => {});
const fetchFollowingIds = mock(async () => ["creator", "blocked"]);
const fetchBlockRelationshipIds = mock(async () => ({
	blockedUserIds: ["blocked"],
	blockedByUserIds: [],
}));
const hasBlockRelationship = mock(async () => false);
const fetchAuthorsBatch = mock(
	async (userIds: string[]) =>
		new Map(
			userIds.map((id) => [
				id,
				{ id, username: id, fullName: id, lowQualityProfilePictureFile: null },
			]),
		),
);

mock.module("@/core/databases", () => ({
	prisma: {
		story: {
			findMany: storyFindMany,
			create: storyCreate,
			findUnique: storyFindUnique,
		},
		storyView: { findMany: storyViewFindMany, upsert: storyViewUpsert },
	},
}));
mock.module("@/core/services/user-service.client", () => ({
	userServiceClient: {
		fetchFollowingIds,
		fetchBlockRelationshipIds,
		hasBlockRelationship,
		fetchAuthorsBatch,
	},
}));
mock.module("./services/story-media-storage.service", () => ({
	setStoryMediaFile: upload,
	deleteStoryMediaFile: remove,
}));

const { createStoryRoute } = await import("./routes/create-story.route");
const { getStoriesRoute } = await import("./routes/get-stories.route");
const { markStoryViewedRoute } = await import(
	"./routes/mark-story-viewed.route"
);

const app = new OpenAPIHono<HonoAuthenticatedEnv>();
app.use("*", async (c, next) => {
	c.set("authenticatedUser", { id: "viewer" });
	await next();
});
app.openapiRoutes([createStoryRoute, getStoriesRoute, markStoryViewedRoute]);
app.onError((error, c) => c.json({ message: error.message }, 400));

const story = {
	id: "story-1",
	authorId: "creator",
	mediaType: "IMAGE",
	createdAt: new Date("2026-09-03T10:00:00Z"),
	expiresAt: new Date("2026-09-04T10:00:00Z"),
	mediaFile: {
		id: "file-1",
		filename: "story_story-1.jpg",
		mimeType: "image/jpeg",
		createdAt: new Date("2026-09-03T10:00:00Z"),
	},
};

beforeEach(() => {
	for (const fn of [
		storyFindMany,
		storyCreate,
		storyFindUnique,
		storyViewFindMany,
		storyViewUpsert,
		upload,
		remove,
		fetchFollowingIds,
		fetchBlockRelationshipIds,
		hasBlockRelationship,
		fetchAuthorsBatch,
	]) {
		fn.mockClear();
	}
	storyFindMany.mockResolvedValue([story]);
	storyFindUnique.mockResolvedValue({
		authorId: "creator",
		expiresAt: new Date(Date.now() + 60_000),
	});
});

function storyForm(file: File) {
	const body = new FormData();
	body.set("media", file);
	return body;
}

describe("Story creation", () => {
	test("uploads one supported media file and creates a 24-hour story", async () => {
		storyCreate.mockResolvedValueOnce(story);
		const response = await app.request("/stories", {
			method: "POST",
			body: storyForm(
				new File(["image"], "moment.jpg", { type: "image/jpeg" }),
			),
		});

		expect(response.status).toBe(201);
		expect(upload).toHaveBeenCalledTimes(1);
		expect(storyCreate.mock.calls[0]?.[0].data).toMatchObject({
			authorId: "viewer",
			mediaType: "IMAGE",
		});
		const createdData = storyCreate.mock.calls[0]?.[0].data as {
			expiresAt: Date;
		};
		expect(createdData.expiresAt.getTime()).toBeGreaterThan(
			Date.now() + 23 * 60 * 60 * 1000,
		);
	});

	test("rejects unsupported or oversized media before uploading", async () => {
		for (const file of [
			new File(["text"], "notes.txt", { type: "text/plain" }),
			new File([new Uint8Array(20_000_001)], "large.jpg", {
				type: "image/jpeg",
			}),
		]) {
			const response = await app.request("/stories", {
				method: "POST",
				body: storyForm(file),
			});
			expect(response.status).toBe(400);
		}
		expect(upload).not.toHaveBeenCalled();
		expect(storyCreate).not.toHaveBeenCalled();
	});

	test("cleans up the file when the database write fails", async () => {
		storyCreate.mockRejectedValueOnce(new Error("Database unavailable"));
		const response = await app.request("/stories", {
			method: "POST",
			body: storyForm(
				new File(["image"], "moment.jpg", { type: "image/jpeg" }),
			),
		});

		expect(response.status).toBe(400);
		expect(remove).toHaveBeenCalledTimes(1);
	});
});

describe("Story visibility and views", () => {
	test("returns active stories grouped by followed author with view state", async () => {
		storyFindMany.mockResolvedValueOnce([
			{ ...story, id: "story-unseen", authorId: "creator" },
			{ ...story, id: "story-viewed", authorId: "creator" },
		]);
		storyViewFindMany.mockResolvedValueOnce([{ storyId: "story-viewed" }]);

		const response = await app.request("/stories");
		expect(response.status).toBe(200);
		expect(storyFindMany.mock.calls[0]?.[0]).toMatchObject({
			where: {
				authorId: { in: ["viewer", "creator"] },
				expiresAt: { gt: expect.any(Date) },
			},
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		});
		expect(await response.json()).toMatchObject({
			stories: [
				{
					authorId: "creator",
					stories: [
						{ id: "story-unseen", isViewedByAuthenticatedUser: false },
						{ id: "story-viewed", isViewedByAuthenticatedUser: true },
					],
				},
			],
		});
	});

	test("marks an active story as viewed and ignores an expired story", async () => {
		const response = await app.request("/stories/story-1/view", {
			method: "POST",
		});
		expect(response.status).toBe(200);
		expect(storyViewUpsert).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { storyId_viewerId: { storyId: "story-1", viewerId: "viewer" } },
			}),
		);

		storyFindUnique.mockResolvedValueOnce({
			authorId: "creator",
			expiresAt: new Date(Date.now() - 1),
		});
		const expiredResponse = await app.request("/stories/story-1/view", {
			method: "POST",
		});
		expect(expiredResponse.status).toBe(404);
		expect(storyViewUpsert).toHaveBeenCalledTimes(1);
	});
});
