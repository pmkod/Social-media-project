import { useEffect } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { PostListLoader } from "../common/components/loaders";
import { PostItem } from "../common/post-item.tsx";
import { useUserPosts } from "./use-user-posts.ts";

type UserPostsProps = {
	userId?: string;
};

export function UserPosts({ userId }: UserPostsProps) {
	const userIdToSend = userId || "";

	const query = useUserPosts({ userId: userIdToSend });
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
				title="Unable to load posts"
				description="An error occurred while loading this list."
				onRefresh={() => void query.refetch()}
				isRefetching={query.isRefetching}
				borderless
			/>
		);
	}

	const posts = query.data?.pages.flatMap((page) => page.posts) ?? [];
	if (posts.length === 0) {
		return (
			<EmptyBlock
				title="No posts yet"
				description="Posts by this user will appear here."
				borderless
			/>
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
