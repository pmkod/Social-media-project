import { useEffect } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { PostListLoader } from "@/features/post/common/components/loaders";
import { PostItem } from "@/features/post/common/post-item.tsx";
import {
	type ProfilePostListType,
	useUserProfilePosts,
} from "@/features/user/user-profile-posts/use-user-profile-posts.ts";

type ProfilePostListProps = {
	userId?: string;
	type: ProfilePostListType;
};

export function ProfilePostList({ userId, type }: ProfilePostListProps) {
	const userIdToSend = userId || "";

	const query = useUserProfilePosts({ userId: userIdToSend, type });
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
				title={type === "posts" ? "No posts yet" : "No liked posts"}
				description={
					type === "posts"
						? "Posts by this user will appear here."
						: "Liked posts will appear here."
				}
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
