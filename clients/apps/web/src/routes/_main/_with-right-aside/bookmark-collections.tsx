import { RiAddLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	AppHeader,
	AppHeaderLeftPart,
	AppHeaderRightPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { getExceptionMessage } from "@/core/exceptions/translate-exception-code.ts";
import { useDebounceValue } from "@/core/hooks/use-debounce-value.ts";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { BOOKMARK_COLLECTIONS_PAGE_LIMIT } from "@/features/bookmark/common/bookmark-collection.constants.ts";
import type { BookmarkCollection } from "@/features/bookmark/common/bookmark-collection.ts";
import { BookmarkCollectionItem } from "@/features/bookmark/common/bookmark-collection-item.tsx";
import { BookmarkCollectionItemLoader } from "@/features/bookmark/common/bookmark-collection-item-loader.tsx";
import { BookmarkCollectionModal } from "@/features/bookmark/common/bookmark-collection-modal.tsx";
import { DeleteBookmarkCollectionAlertDialog } from "@/features/bookmark/delete-bookmark-collection/delete-bookmark-collection-alert-dialog.tsx";
import { useBookmarkCollections } from "@/features/bookmark/use-bookmark-collections.ts";
import * as m from "@/paraglide/messages.js";

export const Route = createFileRoute(
	"/_main/_with-right-aside/bookmark-collections",
)({
	component: BookmarkCollectionsPage,
});

function BookmarkCollectionsPage() {
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebounceValue(search, 500);
	const navigate = Route.useNavigate();
	const collectionsQuery = useBookmarkCollections({
		limit: BOOKMARK_COLLECTIONS_PAGE_LIMIT,
		q: debouncedSearch,
	});
	const { ref: observerTargetRef, isIntersecting: isTargetIntersecting } =
		useIntersectionObserver({ rootMargin: "100px" });

	useEffect(() => {
		if (
			!isTargetIntersecting ||
			!collectionsQuery.hasNextPage ||
			collectionsQuery.isFetching
		)
			return;

		collectionsQuery.fetchNextPage();
	}, [
		isTargetIntersecting,
		collectionsQuery.fetchNextPage,
		collectionsQuery.hasNextPage,
		collectionsQuery.isFetching,
	]);

	const collections =
		collectionsQuery.data?.pages.flatMap((page) => page.bookmarkCollections) ??
		[];

	const handleOpenCreateCollectionModal = async () => {
		await NiceModal.show(BookmarkCollectionModal);
	};

	const handleOpenEditCollectionModal = async (
		collection: BookmarkCollection,
	) => {
		await NiceModal.show(BookmarkCollectionModal, { collection });
	};

	const handleDeleteCollection = (collection: BookmarkCollection) => {
		void NiceModal.show(DeleteBookmarkCollectionAlertDialog, {
			collection,
		});
	};

	return (
		<MainContainer>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderTitle>{m.bookmark_collections_title()}</AppHeaderTitle>
				</AppHeaderLeftPart>
				<AppHeaderRightPart>
					<Button
						type="button"
						size="sm"
						onClick={handleOpenCreateCollectionModal}
					>
						<RiAddLine className="size-4" />
						{m.bookmark_collection_create()}
					</Button>
				</AppHeaderRightPart>
			</AppHeader>

			<section className="pb-4">
				<div className="mb-4">
					<input
						type="search"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder={m.bookmark_collection_search()}
						aria-label={m.bookmark_collection_search_label()}
						className="h-11 w-full rounded bg-muted px-4 text-sm text-foreground outline-none transition focus:border focus:border-foreground"
					/>
				</div>

				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					<BookmarkCollectionItem
						name={m.bookmark_collection_all()}
						isSelected={false}
						onClick={() =>
							void navigate({
								to: "/bookmarks",
								search: {},
							})
						}
					/>

					{collectionsQuery.isLoading ? (
						<>
							<BookmarkCollectionItemLoader />
							<BookmarkCollectionItemLoader />
							<BookmarkCollectionItemLoader />
							<BookmarkCollectionItemLoader />
							<BookmarkCollectionItemLoader />
						</>
					) : (
						collections.map((collection) => (
							<BookmarkCollectionItem
								key={collection.id}
								name={collection.name}
								isSelected={false}
								onClick={() =>
									void navigate({
										to: "/bookmarks",
										search: { bookmarkCollectionId: collection.id },
									})
								}
								onEdit={() => void handleOpenEditCollectionModal(collection)}
								onDelete={() => handleDeleteCollection(collection)}
							/>
						))
					)}
				</div>

				{collectionsQuery.isError ? (
					<ExceptionBlock
						className="mt-4"
						title="Unable to load your collections"
						description={getExceptionMessage(collectionsQuery.error)}
						onRefresh={() => void collectionsQuery.refetch()}
						isRefetching={collectionsQuery.isRefetching}
					/>
				) : !collectionsQuery.isLoading && collections.length === 0 ? (
					<EmptyBlock
						className="mt-4"
						title={
							debouncedSearch
								? m.bookmark_collection_empty_search_title()
								: m.bookmark_collection_empty_title()
						}
						description={
							debouncedSearch
								? m.bookmark_collection_empty_search_description()
								: m.bookmark_collection_empty_description()
						}
					/>
				) : null}

				{collectionsQuery.hasNextPage ? (
					<div ref={observerTargetRef} className="mt-3 min-h-1">
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
							<BookmarkCollectionItemLoader />
							<BookmarkCollectionItemLoader />
							<BookmarkCollectionItemLoader />
						</div>
					</div>
				) : null}
			</section>
		</MainContainer>
	);
}
