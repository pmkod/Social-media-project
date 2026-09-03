import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	mock,
	test,
} from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { CreatePostRequestBody } from "./posts.validation-schemas";
import { validateChillzVideo } from "./services/chillz-video-validation.service";

const findMany = mock(async (_args: unknown): Promise<any[]> => []);
const create = mock(async (args: any) => ({ ...args.data, medias: [] }));
const upload = mock(async (_args: unknown) => {});
const remove = mock(async (_args: unknown) => {});
const blocks = mock(async () => ({
	blockedUserIds: ["blocked"],
	blockedByUserIds: ["blocked-by"],
}));
mock.module("@/core/databases", () => ({
	prisma: {
		post: { findMany, create },
		postLike: { findMany: async () => [] },
		bookmark: { findMany: async () => [] },
	},
}));
mock.module("@/core/services/user-service.client", () => ({
	userServiceClient: {
		fetchBlockRelationshipIds: blocks,
		fetchFollowingIds: async () => ["creator", "blocked", "blocked-by"],
		fetchAuthorsBatch: async () => new Map(),
		adjustPostCount: async () => {},
	},
}));
mock.module("@/core/services/storage.service", () => ({ deleteFile: remove }));
mock.module("./services/post-media-storage.service", () => ({
	setPostMediaFile: upload,
}));
const { createPostRoute } = await import("./routes/create-post.route");
const { searchPostsRoute } = await import("./routes/search-posts.route");
const { getUserPostsRoute } = await import("./routes/get-user-posts.route");
const { getFeedFollowingRoute } = await import(
	"./routes/get-feed-following.route"
);
const app = new OpenAPIHono<HonoAuthenticatedEnv>();
app.use("*", async (c, next) => {
	c.set("authenticatedUser", { id: "viewer" });
	await next();
});
app.openapiRoutes([
	createPostRoute,
	searchPostsRoute,
	getUserPostsRoute,
	getFeedFollowingRoute,
]);
app.onError((error, c) => c.json({ message: error.message }, 400));
let directory: string;
let shortVideo: File;
let longVideo: File;
beforeAll(async () => {
	directory = await mkdtemp(join(tmpdir(), "chillz-test-"));
	for (const seconds of [1, 91]) {
		const path = join(directory, `${seconds}.mp4`);
		const process = Bun.spawn(
			[
				"ffmpeg",
				"-hide_banner",
				"-loglevel",
				"error",
				"-f",
				"lavfi",
				"-i",
				"color=c=blue:s=16x16:r=1",
				"-t",
				String(seconds),
				"-c:v",
				"libx264",
				"-pix_fmt",
				"yuv420p",
				path,
			],
			{ stdout: "ignore", stderr: "pipe" },
		);
		if ((await process.exited) !== 0)
			throw new Error(await new Response(process.stderr).text());
	}
	shortVideo = new File(
		[await Bun.file(join(directory, "1.mp4")).arrayBuffer()],
		"short.mp4",
		{ type: "video/mp4" },
	);
	longVideo = new File(
		[await Bun.file(join(directory, "91.mp4")).arrayBuffer()],
		"long.mp4",
		{ type: "video/mp4" },
	);
});
afterAll(async () => {
	if (directory) await rm(directory, { recursive: true, force: true });
});
beforeEach(() => {
	findMany.mockClear();
	create.mockClear();
	upload.mockClear();
	remove.mockClear();
});
function form(type: string, files: File[] = [], text = "") {
	const body = new FormData();
	body.set("type", type);
	body.set("text", text);
	for (const file of files) body.append("medias", file);
	return body;
}

describe("Chillz creation", () => {
	test("preserves existing posts and allows media-only posts", () => {
		expect(CreatePostRequestBody.parse({ text: " Hello " })).toMatchObject({
			type: "POST",
			text: "Hello",
		});
		expect(
			CreatePostRequestBody.parse({ medias: shortVideo }).medias,
		).toHaveLength(1);
		expect(CreatePostRequestBody.safeParse({ text: "  " }).success).toBe(false);
	});
	test("accepts a single multipart video without a caption", async () => {
		const response = await app.request("/posts", {
			method: "POST",
			body: form("CHILLZ", [shortVideo]),
		});
		expect(response.status).toBe(201);
		expect(create.mock.calls[0]?.[0].data).toMatchObject({
			type: "CHILLZ",
			text: "",
			authorId: "viewer",
		});
		expect(create.mock.calls[0]?.[0].data.medias.create).toHaveLength(1);
	});
	test("rejects missing, multiple, image, empty and oversized uploads", async () => {
		for (const files of [
			[],
			[shortVideo, shortVideo],
			[new File(["image"], "image.png", { type: "image/png" })],
			[new File([], "empty.mp4", { type: "video/mp4" })],
			[
				new File([new Uint8Array(20_000_001)], "large.mp4", {
					type: "video/mp4",
				}),
			],
		]) {
			const response = await app.request("/posts", {
				method: "POST",
				body: form("CHILLZ", files),
			});
			expect(response.status).toBe(400);
		}
		expect(create).not.toHaveBeenCalled();
		expect(upload).not.toHaveBeenCalled();
	});
	test("checks real duration and rejects a fake video before uploading", async () => {
		await expect(validateChillzVideo(shortVideo)).resolves.toBeUndefined();
		await expect(validateChillzVideo(longVideo)).rejects.toThrow("90 seconds");
		const response = await app.request("/posts", {
			method: "POST",
			body: form("CHILLZ", [
				new File(["not a video"], "fake.mp4", { type: "video/mp4" }),
			]),
		});
		expect(response.status).toBe(400);
		expect(upload).not.toHaveBeenCalled();
		expect(create).not.toHaveBeenCalled();
	});
	test("cleans up an upload failure without publishing a partial post", async () => {
		upload
			.mockImplementationOnce(async () => {})
			.mockImplementationOnce(async () => {
				throw new Error("Storage unavailable");
			});
		const response = await app.request("/posts", {
			method: "POST",
			body: form("CHILLZ", [shortVideo]),
		});
		expect(response.status).toBe(400);
		expect(create).not.toHaveBeenCalled();
		expect(remove).toHaveBeenCalledTimes(2);
	});
});

describe("Chillz discovery and profiles", () => {
	test("defaults to posts and explicitly filters Chillz before pagination", async () => {
		await app.request("/posts");
		expect(findMany.mock.calls[0]?.[0]).toMatchObject({
			where: { type: "POST" },
		});
		await app.request(
			"/posts?type=CHILLZ&q=moment&limit=2&cursorId=cursor&cursorCreatedAt=2026-09-01T00:00:00Z",
		);
		expect(findMany.mock.calls[1]?.[0]).toMatchObject({
			where: {
				type: "CHILLZ",
				text: { contains: "moment", mode: "insensitive" },
				authorId: { notIn: ["blocked", "blocked-by"] },
				OR: expect.any(Array),
			},
			take: 3,
			select: { type: true },
		});
	});
	test("filters the profile by author and type, hiding blocked profiles", async () => {
		await app.request("/posts/users/creator?type=CHILLZ");
		expect(findMany.mock.calls[0]?.[0]).toMatchObject({
			where: { authorId: "creator", type: "CHILLZ" },
		});
		const response = await app.request("/posts/users/blocked?type=CHILLZ");
		expect(await response.json()).toMatchObject({
			posts: [],
			pagination: { hasNextPage: false },
		});
		expect(findMany).toHaveBeenCalledTimes(1);
	});
	test("rejects unknown types and returns a stable next cursor", async () => {
		expect((await app.request("/posts?type=REEL")).status).toBe(400);
		findMany.mockImplementationOnce(async () => [
			{
				id: "b",
				authorId: "creator",
				createdAt: new Date("2026-09-01"),
				type: "CHILLZ",
			},
			{
				id: "a",
				authorId: "creator",
				createdAt: new Date("2026-09-01"),
				type: "CHILLZ",
			},
		]);
		const response = await app.request("/posts?type=CHILLZ&limit=1");
		expect(await response.json()).toMatchObject({
			posts: [{ id: "b", type: "CHILLZ" }],
			pagination: {
				hasNextPage: true,
				nextCursor: { id: "b", createdAt: "2026-09-01T00:00:00.000Z" },
			},
		});
	});
});

describe("Chillz following feed", () => {
	test("filters Chillz and allowed followed authors before applying the cursor and limit", async () => {
		findMany.mockImplementationOnce(async () => [
			{
				id: "b",
				authorId: "creator",
				type: "CHILLZ",
				createdAt: new Date("2026-09-01"),
			},
			{
				id: "a",
				authorId: "viewer",
				type: "CHILLZ",
				createdAt: new Date("2026-09-01"),
			},
		]);
		const response = await app.request(
			"/feed/following?type=CHILLZ&limit=1&cursorId=c&cursorCreatedAt=2026-09-02T00:00:00Z",
		);
		expect(response.status).toBe(200);
		expect(findMany.mock.calls[0]?.[0]).toMatchObject({
			where: {
				type: "CHILLZ",
				authorId: { in: ["viewer", "creator"] },
				OR: [
					{ createdAt: { lt: new Date("2026-09-02") } },
					{ createdAt: new Date("2026-09-02"), id: { lt: "c" } },
				],
			},
			take: 2,
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		});
		expect(await response.json()).toMatchObject({
			posts: [{ id: "b", type: "CHILLZ" }],
			pagination: {
				limit: 1,
				hasNextPage: true,
				nextCursor: { id: "b", createdAt: "2026-09-01T00:00:00.000Z" },
			},
		});
	});

	test("keeps the original mixed feed and rejects unsupported types", async () => {
		await app.request("/feed/following");
		expect(findMany.mock.calls[0]?.[0]).toMatchObject({
			where: { authorId: { in: ["viewer", "creator"] } },
		});
		expect(findMany.mock.calls[0]?.[0]).not.toHaveProperty("where.type");
		expect((await app.request("/feed/following?type=REEL")).status).toBe(400);
		expect(findMany).toHaveBeenCalledTimes(1);
	});

	test("returns an empty page without an authenticated user or for a blocked author", async () => {
		const anonymousApp = new OpenAPIHono<HonoAuthenticatedEnv>();
		anonymousApp.openapiRoutes([getFeedFollowingRoute]);
		for (const response of [
			await anonymousApp.request("/feed/following?type=CHILLZ"),
			await app.request("/feed/following?type=CHILLZ&authorId=blocked"),
		]) {
			expect(response.status).toBe(200);
			expect(await response.json()).toMatchObject({
				posts: [],
				pagination: { nextCursor: null, hasNextPage: false },
			});
		}
		expect(findMany).not.toHaveBeenCalled();
	});
});
