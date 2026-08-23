import { RiAddLine, RiArrowRightSLine } from "@remixicon/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
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
import { useAlertDialog } from "@/core/hooks/use-alert-dialog.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import type { BookmarkCollection } from "@/features/bookmark/common/bookmark-collection.ts";
import { BookmarkCollectionItem } from "@/features/bookmark/common/bookmark-collection-item.tsx";
import { BookmarkCollectionItemLoader } from "@/features/bookmark/common/bookmark-collection-item-loader.tsx";
import { BookmarkCollectionModal } from "@/features/bookmark/common/bookmark-collection-modal.tsx";
import { useDeleteBookmarkCollection } from "@/features/bookmark/delete-bookmark-collection/use-delete-bookmark-collection.ts";
import { useAddPostToCollection } from "@/features/bookmark/use-add-post-to-collection.ts";
import { useBookmarkCollections } from "@/features/bookmark/use-bookmark-collections.ts";
import { useBookmarks } from "@/features/bookmark/use-bookmarks.ts";
import { useRemovePostFromCollection } from "@/features/bookmark/use-remove-post-from-collection.ts";
import { PostListLoader } from "@/features/post/common/components/loaders";
import { PostItem } from "@/features/post/common/post-item.tsx";

const bookmarksSearchParams = z.object({
	bookmarkCollectionId: z.string().optional(),
});

const BOOKMARK_COLLECTION_PREVIEW_LIMIT = 6;

export const Route = createFileRoute("/_main/bookmarks")({
	validateSearch: bookmarksSearchParams,
	component: BookmarksPage,
});

function CollectionOrganizer({
	postId,
	collections,
}: {
	postId: string;
	collections: BookmarkCollection[];
}) {
	const [collectionId, setCollectionId] = useState(collections[0]?.id ?? "");
	const addPost = useAddPostToCollection();

	if (collections.length === 0) return null;

	return (
		<div className="flex items-center gap-2 border-x border-t border-border px-4 py-2 last:border-b">
			<select
				value={collectionId}
				onChange={(event) => setCollectionId(event.target.value)}
				aria-label="Choose a collection"
				className="h-8 min-w-0 flex-1 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-sky-500"
			>
				{collections.map((collection) => (
					<option key={collection.id} value={collection.id}>
						{collection.name}
					</option>
				))}
			</select>
			<Button
				type="button"
				size="sm"
				variant="outline"
				disabled={!collectionId || addPost.isPending}
				onClick={() => addPost.mutate({ collectionId, postId })}
			>
				<RiAddLine className="size-4" />
				Add
			</Button>
		</div>
	);
}

function BookmarksPage() {
	const { bookmarkCollectionId: selectedCollectionId } = Route.useSearch();
	const navigate = Route.useNavigate();
	const collectionsQuery = useBookmarkCollections({
		limit: BOOKMARK_COLLECTION_PREVIEW_LIMIT,
	});
	const bookmarksQuery = useBookmarks({ collectionId: selectedCollectionId });
	const deleteCollection = useDeleteBookmarkCollection();
	const removeFromCollection = useRemovePostFromCollection();
	const alertDialog = useAlertDialog();

	const collections =
		collectionsQuery.data?.pages.flatMap((page) => page.bookmarksCollections) ??
		[];
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

	const handleOpenCreateCollectionModal = async () => {
		await NiceModal.show(BookmarkCollectionModal);
	};

	const handleOpenEditCollectionModal = async (
		collection: BookmarkCollection,
	) => {
		await NiceModal.show(BookmarkCollectionModal, { collection });
	};

	const handleSelectCollection = async (collectionId?: string) => {
		await navigate({
			to: "/bookmarks",
			search: { bookmarkCollectionId: collectionId },
		});
	};

	const handleDeleteCollection = (collection: BookmarkCollection) => {
		alertDialog.show({
			title: `Delete "${collection.name}"?`,
			description:
				"This collection will be deleted, but the posts will remain in your bookmarks.",
			cancel: { text: "Cancel" },
			confirm: {
				text: "Delete collection",
				colorScheme: "destructive",
				handler: async () => {
					await deleteCollection.mutateAsync(collection.id);
					if (selectedCollectionId === collection.id) {
						await handleSelectCollection();
					}
				},
			},
		});
	};

	return (
		<MainContainer>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderTitle>Bookmarks</AppHeaderTitle>
				</AppHeaderLeftPart>
				<AppHeaderRightPart>
					<Button
						type="button"
						size="sm"
						onClick={handleOpenCreateCollectionModal}
					>
						<RiAddLine className="size-4" />
						Create collection
					</Button>
				</AppHeaderRightPart>
			</AppHeader>

			<section className="pt-2 pb-4">
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					<BookmarkCollectionItem
						name="All bookmarks"
						isSelected={!selectedCollectionId}
						onClick={() => void handleSelectCollection(undefined)}
					/>
					{collectionsQuery.isLoading ? (
						<>
							<BookmarkCollectionItemLoader />
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
								isSelected={selectedCollectionId === collection.id}
								onClick={() => void handleSelectCollection(collection.id)}
								onEdit={() => void handleOpenEditCollectionModal(collection)}
								onDelete={() => handleDeleteCollection(collection)}
							/>
						))
					)}
				</div>

				<div className="mt-2 flex justify-end">
					<Button asChild variant="ghost" size="sm">
						<Link to="/bookmark-collections">
							See all collections
							<RiArrowRightSLine className="size-4" />
						</Link>
					</Button>
				</div>
			</section>

			{bookmarksQuery.isLoading ? (
				<PostListLoader />
			) : bookmarksQuery.isError ? (
				<ExceptionBlock
					title="Unable to load your bookmarks"
					description="An error occurred while loading your saved posts."
					onRefresh={() => void bookmarksQuery.refetch()}
					isRefetching={bookmarksQuery.isRefetching}
				/>
			) : posts.length === 0 ? (
				<EmptyBlock
					title="No saved posts"
					description="Use the bookmark icon below a post to find it here."
				/>
			) : (
				<div>
					{posts.map((post) => (
						<div key={post.id}>
							<PostItem post={post} />
							{selectedCollectionId ? (
								<div className="flex justify-end border-x border-t border-border px-4 py-2 last:border-b">
									<Button
										type="button"
										size="sm"
										variant="ghost"
										disabled={removeFromCollection.isPending}
										onClick={() =>
											removeFromCollection.mutate({
												collectionId: selectedCollectionId,
												postId: post.id,
											})
										}
									>
										Remove from collection
									</Button>
								</div>
							) : (
								<CollectionOrganizer
									postId={post.id}
									collections={collections}
								/>
							)}
						</div>
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
