import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { useMediaQuery } from "@/core/hooks/use-media-query.ts";
import type { Post } from "@/features/post/common/post.ts";
import { usePost } from "@/features/post/post-detail/use-post.ts";
import { useSearchPosts } from "@/features/post/search/use-search-posts.ts";
import { ChillzComments } from "./chillz-comments.tsx";
import { ChillzItem } from "./chillz-item.tsx";
import { ChillzLoader } from "./chillz-loader.tsx";

export function ChillzFeed({
	chillzId,
	focusComment = false,
}: {
	chillzId: string;
	focusComment?: boolean;
}) {
	const navigate = useNavigate();
	const feedRef = useRef<HTMLElement>(null);
	const visibleId = useRef(chillzId);
	const [commentsOpen, setCommentsOpen] = useState(focusComment);
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const query = useSearchPosts({ query: "", type: "CHILLZ" });
	const feedPosts = useMemo(
		() => query.data?.pages.flatMap((page) => page.posts) ?? [],
		[query.data],
	);
	// Keep directly opened videos in the feed even if they are outside its loaded pages.
	const [linkedPosts, setLinkedPosts] = useState<Post[]>([]);
	const isLoaded = [...feedPosts, ...linkedPosts].some(
		(post) => post.id === chillzId,
	);
	const detail = usePost({ postId: isLoaded ? "" : chillzId });
	const linkedPost = detail.data?.post;
	useEffect(() => {
		if (linkedPost?.type === "CHILLZ") {
			setLinkedPosts((posts) =>
				posts.some((post) => post.id === linkedPost.id)
					? posts
					: [...posts, linkedPost],
			);
		}
	}, [linkedPost]);
	const posts = useMemo(
		() => [
			...linkedPosts.map(
				(linked) => feedPosts.find((post) => post.id === linked.id) ?? linked,
			),
			...feedPosts.filter(
				(post) => !linkedPosts.some((linked) => linked.id === post.id),
			),
		],
		[feedPosts, linkedPosts],
	);
	const activePost = posts.find((post) => post.id === chillzId);
	const ready = Boolean(activePost);

	useEffect(() => {
		if (focusComment) setCommentsOpen(true);
	}, [focusComment]);

	const showPost = useCallback(
		(postId: string) => {
			visibleId.current = postId;
			void navigate({
				to: "/chillz/$chillzId",
				params: { chillzId: postId },
				replace: true,
				resetScroll: false,
			});
		},
		[navigate],
	);

	useEffect(() => {
		const feed = feedRef.current;
		if (!feed || !ready || !posts.length) return;
		const items = Array.from(
			feed.querySelectorAll<HTMLElement>("[data-chillz-id]"),
		);
		const selected = items.find((item) => item.dataset.chillzId === chillzId);
		// URL navigation (including a direct link) must also move the feed to that video.
		if (selected && (visibleId.current !== chillzId || feed.scrollTop === 0)) {
			feed.scrollTop +=
				selected.getBoundingClientRect().top - feed.getBoundingClientRect().top;
			visibleId.current = chillzId;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				const current = entries.find(
					(entry) => entry.isIntersecting && entry.intersectionRatio >= 0.6,
				);
				const postId = (current?.target as HTMLElement | undefined)?.dataset
					.chillzId;
				if (postId && postId !== visibleId.current) showPost(postId);
			},
			{ root: feed, threshold: 0.6 },
		);
		for (const item of items) observer.observe(item);
		return () => observer.disconnect();
	}, [chillzId, ready, posts, showPost]);

	const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
		rootMargin: "150px",
	});
	useEffect(() => {
		if (
			isIntersecting &&
			query.hasNextPage &&
			!query.isFetching &&
			!query.isFetchNextPageError
		)
			void query.fetchNextPage();
	}, [
		isIntersecting,
		query.hasNextPage,
		query.isFetching,
		query.isFetchNextPageError,
		query.fetchNextPage,
	]);

	if (!activePost) {
		return (
			<main className="chillz-page">
				{detail.isError || (linkedPost && linkedPost.type !== "CHILLZ") ? (
					<ExceptionBlock
						title="Unable to load Chillz"
						description="This Chillz is unavailable or could not be loaded."
						onRefresh={() => void detail.refetch()}
						isRefetching={detail.isRefetching}
					/>
				) : (
					<ChillzLoader />
				)}
			</main>
		);
	}
	return (
		<main className="chillz-page">
			<section
				ref={feedRef}
				aria-label="Chillz feed. Scroll to see the next video."
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Allow keyboard scrolling of the feed.
				tabIndex={0}
				className="chillz-feed"
			>
				{posts.map((post) => (
					<article
						key={post.id}
						data-chillz-id={post.id}
						aria-label={`Chillz by ${post.author?.fullName ?? "creator"}`}
						className="h-full snap-start snap-always lg:pb-4"
					>
						<ChillzItem
							post={post}
							paused={post.id !== chillzId || (commentsOpen && !isDesktop)}
							commentsOpen={commentsOpen && post.id === chillzId}
							onComment={() => {
								if (post.id !== chillzId) showPost(post.id);
								setCommentsOpen(true);
							}}
						/>
					</article>
				))}
				{query.hasNextPage ? (
					<div
						ref={loadMoreRef}
						className="flex snap-start justify-center py-6"
					>
						<Button
							variant="outline"
							isLoading={query.isFetchingNextPage}
							onClick={() => void query.fetchNextPage()}
						>
							{query.isFetchNextPageError ? "Try again" : "More Chillz"}
						</Button>
					</div>
				) : query.isError ? (
					<ExceptionBlock
						title="Unable to load more Chillz"
						description="Please try again."
						onRefresh={() => void query.refetch()}
						isRefetching={query.isRefetching}
					/>
				) : (
					<p className="snap-start py-6 text-center text-sm text-muted-foreground">
						You're all caught up. Come back for more Chillz.
					</p>
				)}
			</section>
			<ChillzComments
				post={activePost}
				open={commentsOpen}
				onOpenChange={setCommentsOpen}
				isDesktop={isDesktop}
			/>
		</main>
	);
}
