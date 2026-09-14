import { useEffect } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { m } from "@/paraglide/messages.js";
import { PostListLoader } from "../common/components/loaders";
import { PostItem } from "../common/post-item";
import { useFollowingFeed } from "./use-following-feed";

export function Feed() {
	const {
		data,
		error,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useFollowingFeed();
	const { ref: observerTargetRef, isIntersecting: isTargetIntersecting } =
		useIntersectionObserver({ rootMargin: "100px" });

	useEffect(() => {
		if (!isTargetIntersecting || !hasNextPage || isFetching) return;

		fetchNextPage();
	}, [isTargetIntersecting, hasNextPage, isFetching, fetchNextPage]);

	const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

	return (
		<div className="divide-y divide-border min-h-screen">
			{/* Composer */}

			{/* Loading Initial State */}
			{isLoading ? (
				<PostListLoader />
			) : isError ? (
				<ExceptionBlock
					title={m.feed_load_error_title()}
					description={(error as Error).message}
					onRefresh={() => void refetch()}
					isRefetching={isRefetching}
					className="border-0 md:border"
				/>
			) : allPosts.length === 0 ? (
				<EmptyBlock
					title={m.feed_empty_title()}
					description={m.feed_empty_description()}
					className="border-0 md:border"
				/>
			) : (
				/* Feed Posts */
				<div>
					{allPosts.map((post) => (
						<PostItem key={post.id} post={post} />
					))}

					{hasNextPage ? (
						<div ref={observerTargetRef}>
							<PostListLoader count={2} />
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}
