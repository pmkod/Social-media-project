import { RiHeartLine, RiQuillPenLine } from "@remixicon/react";
import { useEffect, useRef } from "react";
import { PostListLoader } from "@/features/post/common/components/loaders";
import { PostItem } from "@/features/post/common/post-item.tsx";
import {
	type ProfilePostListType,
	useUserProfilePosts,
} from "./use-user-profile-posts.ts";

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
			<div className="p-10 text-center text-sm text-rose-500">
				Impossible de charger les publications.
			</div>
		);
	}

	const posts = query.data?.pages.flatMap((page) => page.posts) ?? [];
	if (posts.length === 0) {
		const Icon = type === "posts" ? RiQuillPenLine : RiHeartLine;
		return (
			<div className="p-12 text-center">
				<Icon className="mx-auto mb-3 size-8 text-muted-foreground" />
				<p className="font-semibold text-foreground">
					{type === "posts"
						? "Aucune publication pour le moment"
						: "Aucune publication aimée"}
				</p>
			</div>
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
