import { RiSearchLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { PostListLoader } from "@/features/post/common/components/loaders";
import { PostItem } from "@/features/post/common/post-item.tsx";
import { useSearchPosts } from "@/features/post/search/use-search-posts.ts";

const useDebouncedValue = (value: string, delay: number) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
		return () => window.clearTimeout(timeoutId);
	}, [delay, value]);

	return debouncedValue;
};

export const Route = createFileRoute("/_main/search")({
	component: SearchPage,
});

function SearchPage() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebouncedValue(search.trim(), 350);
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useSearchPosts({ query: debouncedSearch });
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
				<div className="relative block">
					<RiSearchLine className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
					<input
						type="search"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search posts"
						aria-label="Search posts"
						className="h-12 w-full rounded-full border border-transparent bg-muted pl-12 pr-5 text-sm text-foreground outline-none transition focus:border-foreground"
					/>
				</div>
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
