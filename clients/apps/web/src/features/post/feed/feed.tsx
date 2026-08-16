import { useEffect, useRef } from "react";
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
				<div className="p-8 text-center text-rose-500 text-sm">
					Une erreur s'est produite lors du chargement des publications.
				</div>
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
