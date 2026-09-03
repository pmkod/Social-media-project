// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";
import { useFollowingFeed } from "@/features/post/feed/use-following-feed.ts";
import { useFollowingChillzFeed } from "./use-following-chillz-feed.ts";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/core/http-clients/http-client.ts", () => ({ httpClient: { get } }));

let root: Root;
let container: HTMLDivElement;
let client: QueryClient;
let chillz: ReturnType<typeof useFollowingChillzFeed>;
let mixed: ReturnType<typeof useFollowingFeed>;
const cursor = { id: "first-chillz", createdAt: "2026-09-03T12:00:00.000Z" };

function Feeds({ enabled = true }: { enabled?: boolean }) {
	chillz = useFollowingChillzFeed({ enabled });
	mixed = useFollowingFeed();
	return null;
}

beforeEach(() => {
	vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	container = document.createElement("div");
	document.body.append(container);
	root = createRoot(container);
	get
		.mockReset()
		.mockImplementation(
			(_url: string, { searchParams }: { searchParams: URLSearchParams }) => ({
				json: async () => {
					const isChillz = searchParams.get("type") === "CHILLZ";
					const next =
						isChillz && !searchParams.has("cursorId") ? cursor : null;
					return {
						posts: [
							{
								id: isChillz
									? next
										? "first-chillz"
										: "second-chillz"
									: "mixed-post",
							},
						],
						pagination: {
							nextCursor: next,
							hasNextPage: Boolean(next),
							limit: 4,
						},
					};
				},
			}),
		);
});

afterEach(async () => {
	await act(() => root.unmount());
	client.clear();
	container.remove();
	vi.unstubAllGlobals();
});

async function renderFeeds(enabled = true) {
	await act(() =>
		root.render(
			<QueryClientProvider client={client}>
				<Feeds enabled={enabled} />
			</QueryClientProvider>,
		),
	);
	await vi.waitFor(async () => {
		await act(async () => {});
		expect(mixed.isSuccess).toBe(true);
		if (enabled) expect(chillz.isSuccess).toBe(true);
	});
}

test("uses a separate cache and forwards the Chillz filter on every page", async () => {
	await renderFeeds();
	expect(mixed.data?.pages[0].posts[0].id).toBe("mixed-post");
	expect(chillz.data?.pages[0].posts[0].id).toBe("first-chillz");
	expect(client.getQueryCache().getAll()).toHaveLength(2);
	expect(postListQueryKeys.feedFollowing()).toEqual([
		"post-list",
		"feed",
		"following",
	]);
	expect(postListQueryKeys.feedFollowing("CHILLZ")).toEqual([
		"post-list",
		"feed",
		"following",
		"CHILLZ",
	]);

	let result: Awaited<ReturnType<typeof chillz.fetchNextPage>> | undefined;
	await act(async () => {
		result = await chillz.fetchNextPage();
	});
	expect(
		result?.data?.pages.flatMap((page) => page.posts.map((post) => post.id)),
	).toEqual(["first-chillz", "second-chillz"]);
	expect(result?.hasNextPage).toBe(false);
	const requests = get.mock.calls.filter(
		([, options]) => options.searchParams.get("type") === "CHILLZ",
	);
	expect(requests).toHaveLength(2);
	for (const [url, options] of requests) {
		expect(url).toBe("feed/following");
		expect(options.searchParams.get("limit")).toBe("4");
	}
	expect(requests[0][1].searchParams.has("cursorId")).toBe(false);
	expect(requests[1][1].searchParams.get("cursorId")).toBe(cursor.id);
	expect(requests[1][1].searchParams.get("cursorCreatedAt")).toBe(
		cursor.createdAt,
	);
});

test("defers the Chillz request while disabled and loads it when enabled", async () => {
	await renderFeeds(false);
	expect(get).toHaveBeenCalledTimes(1);
	expect(chillz.fetchStatus).toBe("idle");
	await renderFeeds(true);
	expect(
		get.mock.calls.filter(
			([, options]) => options.searchParams.get("type") === "CHILLZ",
		),
	).toHaveLength(1);
	expect(chillz.data?.pages[0].posts[0].id).toBe("first-chillz");
});
