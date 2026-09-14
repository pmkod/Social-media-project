import { useEffect } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { PostListLoader } from "@/features/post/common/components/loaders";
import { PostItem } from "@/features/post/common/post-item.tsx";
import * as m from "@/paraglide/messages.js";
import { useSearchPosts } from "./use-search-posts.ts";

type PostSearchListProps = {
	query: string;
};

function PostSearchList({ query }: PostSearchListProps) {
	const hasSearchQuery = query.trim().length > 0;
	const postsQuery = useSearchPosts({ query });
	const { ref: postsObserverTargetRef, isIntersecting } =
		useIntersectionObserver({ rootMargin: "100px" });

	useEffect(() => {
		if (!isIntersecting || !postsQuery.hasNextPage || postsQuery.isFetching)
			return;

		postsQuery.fetchNextPage();
	}, [
		isIntersecting,
		postsQuery.fetchNextPage,
		postsQuery.hasNextPage,
		postsQuery.isFetching,
	]);

	const posts = postsQuery.data?.pages.flatMap((page) => page.posts) ?? [];

	return (
		<section aria-label={m.search_posts_label()}>
			<h2 className="mb-3 px-1 font-semibold">{m.search_posts_label()}</h2>
			{postsQuery.isLoading ? (
				<PostListLoader />
			) : postsQuery.isError ? (
				<ExceptionBlock
					title="Unable to load posts"
					description={(postsQuery.error as Error)?.message}
					onRefresh={() => void postsQuery.refetch()}
					isRefetching={postsQuery.isRefetching}
					className="border-0 md:border"
				/>
			) : posts.length === 0 ? (
				<EmptyBlock
					title={
						hasSearchQuery
							? m.search_posts_empty_title()
							: m.search_posts_empty_default_title()
					}
					description={
						hasSearchQuery
							? m.search_posts_empty_query({ query })
							: m.search_posts_empty_default_description()
					}
					className="border-0 md:border"
				/>
			) : (
				<div>
					{posts.map((post) => (
						<PostItem key={post.id} post={post} />
					))}
					{postsQuery.hasNextPage ? (
						<div ref={postsObserverTargetRef} className="min-h-1">
							<PostListLoader count={2} />
						</div>
					) : null}
				</div>
			)}
		</section>
	);
}

export { PostSearchList };
