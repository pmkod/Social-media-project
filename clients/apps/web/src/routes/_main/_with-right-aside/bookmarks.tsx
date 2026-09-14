import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { getExceptionMessage } from "@/core/exceptions/translate-exception-code.ts";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { useBookmarks } from "@/features/bookmark/use-bookmarks.ts";
import { PostListLoader } from "@/features/post/common/components/loaders";
import { PostItem } from "@/features/post/common/post-item.tsx";
import * as m from "@/paraglide/messages.js";

const bookmarksSearchParams = z.object({
	bookmarkCollectionId: z.string().optional(),
});

export const Route = createFileRoute("/_main/_with-right-aside/bookmarks")({
	validateSearch: bookmarksSearchParams,
	component: BookmarksPage,
});

function BookmarksPage() {
	const { bookmarkCollectionId: selectedCollectionId } = Route.useSearch();
	const bookmarksQuery = useBookmarks({
		bookmarkCollectionId: selectedCollectionId,
	});

	const posts = bookmarksQuery.data?.pages.flatMap((page) => page.posts) ?? [];
	const { ref: observerTargetRef, isIntersecting: isTargetIntersecting } =
		useIntersectionObserver({ rootMargin: "100px" });

	useEffect(() => {
		if (
			!isTargetIntersecting ||
			!bookmarksQuery.hasNextPage ||
			bookmarksQuery.isFetching
		)
			return;

		bookmarksQuery.fetchNextPage();
	}, [
		isTargetIntersecting,
		bookmarksQuery.fetchNextPage,
		bookmarksQuery.hasNextPage,
		bookmarksQuery.isFetching,
	]);

	return (
		<MainContainer>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton />
					<AppHeaderTitle>{m.bookmarks_title()}</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>

			{bookmarksQuery.isLoading ? (
				<PostListLoader />
			) : bookmarksQuery.isError ? (
				<ExceptionBlock
					title="Unable to load your bookmarks"
					description={getExceptionMessage(bookmarksQuery.error)}
					onRefresh={() => void bookmarksQuery.refetch()}
					isRefetching={bookmarksQuery.isRefetching}
				/>
			) : posts.length === 0 ? (
				<EmptyBlock
					title={m.bookmarks_empty_title()}
					description={m.bookmarks_empty_description()}
					className="h-96"
				/>
			) : (
				<div>
					{posts.map((post) => (
						<PostItem key={post.id} post={post} />
					))}
					{bookmarksQuery.hasNextPage ? (
						<div ref={observerTargetRef}>
							<PostListLoader count={2} />
						</div>
					) : null}
				</div>
			)}
		</MainContainer>
	);
}
