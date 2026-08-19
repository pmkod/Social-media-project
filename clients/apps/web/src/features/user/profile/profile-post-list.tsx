import { useEffect, useRef } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { PostListLoader } from "@/features/post/common/components/loaders";
import { PostItem } from "@/features/post/common/post-item.tsx";
import {
	type ProfilePostListType,
	useUserProfilePosts,
} from "@/features/user/user-profile-posts/use-user-profile-posts.ts";

type ProfilePostListProps = {
	userId: string;
	type: ProfilePostListType;
};

export function ProfilePostList({ userId, type }: ProfilePostListProps) {
	const observerTargetRef = useRef<HTMLDivElement>(null);
	const query = useUserProfilePosts(userId, type);

	useEffect(() => {
		const target = observerTargetRef.current;
		if (!target) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (
					entry.isIntersecting &&
					query.hasNextPage &&
					!query.isFetchingNextPage
				) {
					query.fetchNextPage();
				}
			},
			{ rootMargin: "300px" },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [query.fetchNextPage, query.hasNextPage, query.isFetchingNextPage]);

	if (query.isLoading) return <PostListLoader />;
	if (query.isError) {
		return (
			<ExceptionBlock
				title="Unable to load posts"
				description="An error occurred while loading this list."
				onRefresh={() => void query.refetch()}
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
			{posts.map((post) => (
				<PostItem key={post.id} post={post} />
			))}
			<div ref={observerTargetRef}>
				{query.hasNextPage ? <PostListLoader count={2} /> : null}
			</div>
		</div>
	);
}
