import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { ChillzItem } from "@/features/chillz/chillz-item.tsx";
import { useSearchPosts } from "@/features/post/search/use-search-posts.ts";

export const Route = createFileRoute("/_main/chillz")({
	// validateSearch: z.object({ q: z.string().trim().max(100).optional() }),
	component: ChillzPage,
});

function ChillzPage() {
	const feedRef = useRef<HTMLElement>(null);
	const query = useSearchPosts({ query: "", type: "CHILLZ" });
	const { ref, isIntersecting } = useIntersectionObserver({
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
	const posts = query.data?.pages.flatMap((page) => page.posts) ?? [];
	return (
		<main className="mx-auto flex h-screen min-w-0 w-full max-w-5xl flex-1 justify-center pr-44 gap-5 py-10">
			<section
				ref={feedRef}
				// aria-label="Chillz feed. Scroll to see the next video."
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Allow keyboard scrolling of the feed.
				tabIndex={0}
				className="h-[calc(100dvh-11rem)] overflow-y-auto overflow-x-visible overscroll-contain snap-y snap-proximity outline-offset-2 md:h-full"
			>
				{query.isPending ? (
					<Skeleton className="mx-auto h-[65vh] w-full max-w-md rounded-2xl" />
				) : query.isError && !query.data ? (
					<ExceptionBlock
						title="Unable to load Chillz"
						description="Please try again."
						onRefresh={() => void query.refetch()}
						isRefetching={query.isRefetching}
					/>
				) : posts.length === 0 ? (
					<EmptyBlock
						title={"Share your first Chillz"}
						description={"Share the first Chillz: a video of up to 90 seconds."}
					/>
				) : (
					posts.map((post) => (
						<div key={post.id} className="snap-start h-full">
							<ChillzItem post={post} />
						</div>
					))
				)}
				{query.hasNextPage ? (
					<div ref={ref} className="flex justify-center py-6">
						<Button
							variant="outline"
							isLoading={query.isFetchingNextPage}
							onClick={() => void query.fetchNextPage()}
						>
							{query.isFetchNextPageError ? "Try again" : "More Chillz"}
						</Button>
					</div>
				) : posts.length ? (
					<p className="py-6 text-center text-sm text-muted-foreground">
						You're all caught up. Come back for more Chillz.
					</p>
				) : null}
			</section>
		</main>
	);
}
