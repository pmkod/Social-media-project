import { useEffect, useRef } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { PostListLoader } from "../common/components/loaders";
import { PostItem } from "../common/post-item";
import { useFollowingFeed } from "./use-following-feed";

export function Feed() {
	const observerTargetRef = useRef<HTMLDivElement>(null);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useFollowingFeed();

	useEffect(() => {
		const target = observerTargetRef.current;
		if (!target) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

					<div ref={observerTargetRef}>
						<PostListLoader count={2} />
					</div>
				</div>
			)}
		</div>
	);
}
