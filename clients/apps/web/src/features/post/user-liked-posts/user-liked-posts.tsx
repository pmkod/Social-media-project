import { useEffect } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { PostListLoader } from "../common/components/loaders";
import { PostItem } from "../common/post-item.tsx";
import { useUserLikedPosts } from "./use-user-liked-posts.ts";

type UserLikedPostsProps = {
	userId?: string;
};

export function UserLikedPosts({ userId }: UserLikedPostsProps) {
	const userIdToSend = userId || "";

	const query = useUserLikedPosts({ userId: userIdToSend });
	const { ref: observerTargetRef, isIntersecting: isTargetIntersecting } =
		useIntersectionObserver({ rootMargin: "100px" });

	useEffect(() => {
		if (!isTargetIntersecting || !query.hasNextPage || query.isFetching) return;

		query.fetchNextPage();
	}, [
		isTargetIntersecting,
		query.fetchNextPage,
		query.hasNextPage,
		query.isFetching,
	]);

	if (query.isLoading || query.isPending)
		return <PostListLoader roundedTopOnFirstItem={false} />;
	if (query.isError) {
		return (
			<ExceptionBlock
				title="Unable to load liked posts"
				description="An error occurred while loading this list."
				onRefresh={() => void query.refetch()}
				isRefetching={query.isRefetching}
				bordered={false}
			/>
		);
	}

	const posts = query.data?.pages.flatMap((page) => page.posts) ?? [];
	if (posts.length === 0) {
		return (
			<div className="rounded-b-xl border-b border-x overflow-hidden">
				<EmptyBlock
					title="No liked posts"
					description="Liked posts will appear here."
					bordered={false}
				/>
			</div>
		);
	}

	return (
		<div>
			{posts.map((post, index) => (
				<PostItem
					roundedTopOnFirstItem={index === 0 ? false : undefined}
					key={post.id}
					post={post}
				/>
			))}
			<div ref={observerTargetRef}>
				{query.hasNextPage ? <PostListLoader count={2} /> : null}
			</div>
		</div>
	);
}
