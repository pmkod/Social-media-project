import { RiLoader4Line } from "@remixicon/react";
import { useEffect, useRef } from "react";
import { PostItem } from "../common/post-item";
import { useGetInfinitePosts } from "./use-get-infinite-posts";

export function Feed() {
	const observerTargetRef = useRef<HTMLDivElement>(null);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useGetInfinitePosts();

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

	const allPosts = data?.pages.flatMap((page) => page.data) ?? [];

	return (
		<div className="divide-y divide-border min-h-screen">
			{/* Composer */}

			{/* Loading Initial State */}
			{isLoading ? (
				<div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
					<RiLoader4Line className="h-6 w-6 animate-spin text-sky-500" />
					<span className="text-sm">Chargement des posts...</span>
				</div>
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

					{/* IntersectionObserver Sentinel for Infinite Scroll */}
					<div
						ref={observerTargetRef}
						className="p-6 flex items-center justify-center text-xs text-muted-foreground min-h-16"
					>
						{isFetchingNextPage ? (
							<div className="flex items-center gap-2 text-sky-500">
								<RiLoader4Line className="h-4 w-4 animate-spin" />
								<span>Chargement des publications suivantes...</span>
							</div>
						) : hasNextPage ? (
							<span>Défiler pour charger plus...</span>
						) : allPosts.length > 0 ? (
							<span>Vous avez tout vu ! 🎉</span>
						) : (
							<span>Aucune publication pour le moment.</span>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
