import { RiLoader4Line, RiSearchLine } from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { PostListLoader } from "../common/components/loaders";
import { PostItem } from "../common/post-item.tsx";
import { useSearchPosts } from "./use-search-posts.ts";

const useDebouncedValue = (value: string, delay: number) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
		return () => window.clearTimeout(timeoutId);
	}, [delay, value]);

	return debouncedValue;
};

export function SearchView() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebouncedValue(search.trim(), 350);
	const observerTargetRef = useRef<HTMLDivElement>(null);
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		refetch,
	} = useSearchPosts(debouncedSearch);

	useEffect(() => {
		const target = observerTargetRef.current;
		if (!target) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ rootMargin: "300px" },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const posts = data?.pages.flatMap((page) => page.posts) ?? [];

	return (
		<div className="min-h-screen border-x border-border">
			<header className="sticky top-0 z-20 border-b border-border bg-background/90 p-4 backdrop-blur-xl">
				<h1 className="mb-3 text-xl font-bold text-foreground">Search</h1>
				<label className="relative block">
					<RiSearchLine className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
					<input
						type="search"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search posts"
						aria-label="Search posts"
						className="h-12 w-full rounded-full border border-transparent bg-muted pl-12 pr-5 text-sm text-foreground outline-none transition focus:border-sky-500 focus:bg-background focus:ring-2 focus:ring-sky-500/20"
					/>
				</label>
			</header>

			<div className="border-b border-border px-4 py-3">
				<h2 className="text-sm font-semibold text-foreground">
					{debouncedSearch
						? `Results for “${debouncedSearch}”`
						: "Recent posts"}
				</h2>
			</div>

			{isLoading ? (
				<PostListLoader />
			) : isError ? (
				<ExceptionBlock
					title="Unable to load results"
					description="An error occurred while searching."
					onRefresh={() => void refetch()}
				/>
			) : posts.length === 0 ? (
				<EmptyBlock title="No results" description="Try different keywords." />
			) : (
				<div>
					{posts.map((post) => (
						<PostItem key={post.id} post={post} />
					))}
					<div ref={observerTargetRef} className="min-h-1">
						{hasNextPage ? (
							<PostListLoader count={isFetchingNextPage ? 2 : 1} />
						) : (
							<div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
								<RiLoader4Line className="hidden size-4 animate-spin" />
								You've seen all posts.
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
