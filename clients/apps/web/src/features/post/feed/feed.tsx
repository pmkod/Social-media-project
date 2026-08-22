import { useEffect } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { PostListLoader } from "../common/components/loaders";
import { PostItem } from "../common/post-item";
import { useFollowingFeed } from "./use-following-feed";

export function Feed() {
	const {
		data,
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
					title="Unable to load feed"
					description="An error occurred while loading posts."
					onRefresh={() => void refetch()}
					isRefetching={isRefetching}
				/>
			) : allPosts.length === 0 ? (
				<EmptyBlock
					title="No posts yet"
					description="Follow users to see their posts in your feed."
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
