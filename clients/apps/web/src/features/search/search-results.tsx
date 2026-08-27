import { useEffect } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { PostListLoader } from "@/features/post/common/components/loaders";
import { PostItem } from "@/features/post/common/post-item.tsx";
import { useSearchPosts } from "@/features/post/search/use-search-posts.ts";
import { UserRowItem } from "@/features/user/common/components/user-row-item.tsx";
import { UserRowItemListLoader } from "@/features/user/common/components/user-row-item-list-loader.tsx";
import type { User } from "@/features/user/common/user.ts";
import { useSearchUsers } from "@/features/user/search/use-search-users.ts";

type SearchResultsProps = {
	query: string;
	onSelectUser: (user: User) => void;
};

function SearchResults({ query, onSelectUser }: SearchResultsProps) {
	const usersQuery = useSearchUsers({ query, limit: 5 });
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

	const users = usersQuery.data?.pages.flatMap((page) => page.users) ?? [];
	const posts = postsQuery.data?.pages.flatMap((page) => page.posts) ?? [];

	return (
		<div className="pb-8">
			<section className="mb-6 overflow-hidden rounded-xl border border-border bg-background">
				<h2 className="border-b border-border px-6 py-4 text-lg font-semibold text-foreground">
					People
				</h2>

				{usersQuery.isLoading ? (
					<UserRowItemListLoader count={5} />
				) : usersQuery.isError ? (
					<ExceptionBlock
						borderless
						title="Unable to load people"
						description="An error occurred while searching for people."
						onRefresh={() => void usersQuery.refetch()}
						isRefetching={usersQuery.isRefetching}
					/>
				) : users.length === 0 ? (
					<p className="px-6 py-5 text-sm text-muted-foreground">
						No people found for “{query}”.
					</p>
				) : (
					<>
						{users.map((user) => (
							<UserRowItem
								key={user.id}
								user={user}
								onClick={() => onSelectUser(user)}
							/>
						))}
						{usersQuery.hasNextPage ? (
							<div className="border-t border-border p-2">
								<Button
									type="button"
									variant="ghost"
									fullWidth
									isLoading={usersQuery.isFetchingNextPage}
									onClick={() => void usersQuery.fetchNextPage()}
								>
									Show more people
								</Button>
							</div>
						) : null}
					</>
				)}
			</section>

			<section>
				<h2 className="mb-3 px-1 text-lg font-semibold text-foreground">
					Posts
				</h2>

				{postsQuery.isLoading ? (
					<PostListLoader />
				) : postsQuery.isError ? (
					<ExceptionBlock
						title="Unable to load posts"
						description="An error occurred while searching posts."
						onRefresh={() => void postsQuery.refetch()}
						isRefetching={postsQuery.isRefetching}
					/>
				) : posts.length === 0 ? (
					<EmptyBlock
						title="No posts found"
						description={`No posts match “${query}”.`}
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
		</div>
	);
}

export { SearchResults };
