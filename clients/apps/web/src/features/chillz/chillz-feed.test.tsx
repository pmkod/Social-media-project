// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ChillzFeed } from "./chillz-feed.tsx";
import { LatestChillzPage } from "./latest-chillz-page.tsx";

const mocks = vi.hoisted(() => ({
	navigate: vi.fn(),
	search: vi.fn(),
	detail: vi.fn(),
	comments: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mocks.navigate,
	Navigate: ({ params }: { params: { chillzId: string } }) => (
		<span data-destination={params.chillzId} />
	),
}));
vi.mock("@/features/post/search/use-search-posts.ts", () => ({
	useSearchPosts: mocks.search,
}));
vi.mock("@/features/post/post-detail/use-post.ts", () => ({
	usePost: mocks.detail,
}));
vi.mock("./chillz-item.tsx", () => ({
	ChillzItem: ({
		post,
		onComment,
		paused,
	}: {
		post: { id: string };
		onComment: () => void;
		paused: boolean;
	}) => (
		<button type="button" data-paused={paused} onClick={onComment}>
			Comments for {post.id}
		</button>
	),
}));
vi.mock("@/features/comment", () => ({
	useComments: mocks.comments,
	CommentListLoader: () => <span>Loading comments</span>,
	CommentItem: ({ comment }: { comment: { content: string } }) => (
		<p>{comment.content}</p>
	),
	CreateCommentForm: ({ postId }: { postId: string }) => (
		<input aria-label={`Write to ${postId}`} defaultValue="" />
	),
}));

const posts = ["latest", "older"].map((id, index) => ({
	id,
	type: "CHILLZ",
	text: id,
	author: { fullName: id },
	commentsCount: index + 1,
	createdAt: `2026-09-0${4 - index}T00:00:00Z`,
}));
let root: Root;
let container: HTMLDivElement;
let desktop: boolean;
let mediaListeners: Set<() => void>;
let observers: Array<{
	callback: IntersectionObserverCallback;
	options?: IntersectionObserverInit;
	disconnected: boolean;
}>;

beforeEach(() => {
	vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	desktop = true;
	mediaListeners = new Set();
	vi.stubGlobal("matchMedia", () => ({
		matches: desktop,
		addEventListener: (_event: string, callback: () => void) =>
			mediaListeners.add(callback),
		removeEventListener: (_event: string, callback: () => void) =>
			mediaListeners.delete(callback),
	}));
	observers = [];
	vi.stubGlobal(
		"IntersectionObserver",
		class {
			entry: (typeof observers)[number];
			thresholds = [0];
			constructor(
				callback: IntersectionObserverCallback,
				options?: IntersectionObserverInit,
			) {
				this.entry = { callback, options, disconnected: false };
				observers.push(this.entry);
			}
			observe() {}
			disconnect() {
				this.entry.disconnected = true;
			}
		},
	);
	mocks.navigate.mockReset();
	mocks.search.mockReturnValue({
		data: { pages: [{ posts }] },
		isPending: false,
		isError: false,
		hasNextPage: false,
	});
	mocks.detail.mockReturnValue({ isPending: true });
	mocks.comments.mockImplementation(({ postId }: { postId: string }) => ({
		data: {
			pages: [{ data: [{ id: postId, content: `Comment on ${postId}` }] }],
		},
		isPending: false,
		hasNextPage: false,
	}));
	container = document.createElement("div");
	document.body.append(container);
	root = createRoot(container);
});

afterEach(async () => {
	await act(() => root.unmount());
	container.remove();
	vi.unstubAllGlobals();
});

test("keeps the desktop panel open and resets the comment draft when the visible Chillz changes", async () => {
	await act(() => root.render(<ChillzFeed chillzId="latest" />));
	expect(document.querySelector("#chillz-comments")).toBeNull();
	await act(() => container.querySelector("button")?.click());
	expect(document.querySelector("#chillz-comments")?.textContent).toContain(
		"Comment on latest",
	);
	const draft = document.querySelector("input");
	if (!draft) throw new Error("Missing comment form");
	draft.value = "Draft for the first video";
	const observer = [...observers]
		.reverse()
		.find((entry) => entry.options?.root && !entry.disconnected);
	const target = container.querySelector('[data-chillz-id="older"]');
	if (!observer || !target) throw new Error("Missing feed observer");
	await act(() =>
		observer.callback(
			[
				{
					target,
					isIntersecting: true,
					intersectionRatio: 0.9,
				} as IntersectionObserverEntry,
			],
			{} as IntersectionObserver,
		),
	);
	expect(mocks.navigate).toHaveBeenCalledWith({
		to: "/chillz/$chillzId",
		params: { chillzId: "older" },
		replace: true,
		resetScroll: false,
	});
	await act(() => root.render(<ChillzFeed chillzId="older" />));
	expect(document.querySelector("#chillz-comments")?.textContent).toContain(
		"Comment on older",
	);
	expect(document.querySelector("#chillz-comments")?.textContent).not.toContain(
		"Comment on latest",
	);
	expect(document.querySelector("input")?.value).toBe("");
	expect(
		container
			.querySelector('[data-chillz-id="older"] button')
			?.getAttribute("data-paused"),
	).toBe("false");
});

test("uses a bottom Sheet below desktop and preserves the open comments when resizing", async () => {
	desktop = false;
	await act(() => root.render(<ChillzFeed chillzId="latest" />));
	await act(() => container.querySelector("button")?.click());
	const sheet = document.querySelector(
		'[role="dialog"][data-slot="sheet-content"]',
	);
	expect(sheet?.textContent).toContain("Comment on latest");
	expect(sheet?.className).toContain("bottom-0");
	expect(container.querySelector("button")?.getAttribute("data-paused")).toBe(
		"true",
	);
	await act(() => {
		desktop = true;
		for (const listener of [...mediaListeners]) listener();
	});
	expect(document.querySelector('[role="dialog"]')).toBeNull();
	expect(
		document.querySelector("aside#chillz-comments")?.textContent,
	).toContain("Comment on latest");
	await act(() =>
		(
			document.querySelector(
				'[aria-label="Close comments"]',
			) as HTMLButtonElement
		)?.click(),
	);
	expect(document.querySelector("#chillz-comments")).toBeNull();
});

test("opens a direct link outside the loaded feed without duplicating it when pagination catches up", async () => {
	mocks.detail.mockReturnValue({
		data: { post: { ...posts[0], id: "linked" } },
	});
	await act(() => root.render(<ChillzFeed chillzId="linked" />));
	expect(container.querySelectorAll('[data-chillz-id="linked"]')).toHaveLength(
		1,
	);
	mocks.search.mockReturnValue({
		data: { pages: [{ posts: [...posts, { ...posts[0], id: "linked" }] }] },
	});
	await act(() => root.render(<ChillzFeed chillzId="linked" />));
	expect(container.querySelectorAll('[data-chillz-id="linked"]')).toHaveLength(
		1,
	);
});

test("shows a loader until the latest feed refresh finishes, then redirects to the newest Chillz", async () => {
	mocks.search.mockReturnValue({
		data: { pages: [{ posts: [posts[1]] }] },
		isRefetching: true,
	});
	await act(() => root.render(<LatestChillzPage />));
	expect(container.querySelector('[role="status"]')).not.toBeNull();
	expect(container.querySelector("[data-destination]")).toBeNull();
	mocks.search.mockReturnValue({
		data: { pages: [{ posts }] },
		isRefetching: false,
	});
	await act(() => root.render(<LatestChillzPage />));
	expect(
		container
			.querySelector("[data-destination]")
			?.getAttribute("data-destination"),
	).toBe("latest");
});
