import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { PostListLoader } from "@/features/post/common/components/loaders";
import { PostItem } from "@/features/post/common/post-item.tsx";
import { useSearchPosts } from "@/features/post/search/use-search-posts.ts";
import { SearchBar } from "@/features/search/search-bar";

export const Route = createFileRoute("/_main/_with-right-aside/search")({
	component: SearchPage,
});

function SearchPage() {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useSearchPosts({ query: "" });
	const { ref: observerTargetRef, isIntersecting: isTargetIntersecting } =
		useIntersectionObserver({ rootMargin: "100px" });

	useEffect(() => {
		if (!isTargetIntersecting || !hasNextPage || isFetching) return;

		fetchNextPage();
	}, [isTargetIntersecting, hasNextPage, isFetching, fetchNextPage]);

	const posts = data?.pages.flatMap((page) => page.posts) ?? [];

	return (
		<MainContainer>
			<div className="py-5">
				<SearchBar />
			</div>

			{isLoading ? (
				<PostListLoader />
			) : isError ? (
				<ExceptionBlock
					title="Unable to load results"
					description="An error occurred while searching."
					onRefresh={() => void refetch()}
					isRefetching={isRefetching}
				/>
			) : posts.length === 0 ? (
				<EmptyBlock title="No results" description="Try different keywords." />
			) : (
				<div>
					{posts.map((post) => (
						<PostItem key={post.id} post={post} />
					))}
					{hasNextPage ? (
						<div ref={observerTargetRef} className="min-h-1">
							<PostListLoader count={2} />
						</div>
					) : null}
				</div>
			)}
		</MainContainer>
	);
}
