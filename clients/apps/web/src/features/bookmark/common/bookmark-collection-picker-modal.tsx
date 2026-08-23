import {
	RiAddLine,
	RiBookmarkFill,
	RiBookmarkLine,
	RiLoader4Line,
} from "@remixicon/react";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { IconButton } from "@/core/components/ui/icon-button.tsx";
import NiceModal, {
	create,
	useModal,
} from "@/core/components/ui/nice-modal.tsx";
import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { useDebounceValue } from "@/core/hooks/use-debounce-value.ts";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { useAddBookmark } from "../use-add-bookmark.ts";
import { useBookmarkCollections } from "../use-bookmark-collections.ts";
import { useRemoveBookmark } from "../use-remove-bookmark.ts";
import { useRemovePostFromCollection } from "../use-remove-post-from-collection.ts";
import { BOOKMARK_COLLECTIONS_PAGE_LIMIT } from "./bookmark-collection.constants.ts";
import type { BookmarkCollection } from "./bookmark-collection.ts";
import { BookmarkCollectionModal } from "./bookmark-collection-modal.tsx";

type BookmarkCollectionPickerModalProps = {
	isBookmarked: boolean;
	postId: string;
};

const BookmarkCollectionPickerModal =
	create<BookmarkCollectionPickerModalProps>((props) => {
		const { isBookmarked: initialIsBookmarked, postId } = props;
		const modal = useModal();
		const addBookmark = useAddBookmark();
		const removeBookmark = useRemoveBookmark();
		const removePostFromCollection = useRemovePostFromCollection();
		const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
		const [search, setSearch] = useState("");
		const [debouncedSearch] = useDebounceValue(search, 500);
		const [scrollContainer, setScrollContainer] =
			useState<HTMLDivElement | null>(null);
		const collectionsQuery = useBookmarkCollections({
			limit: BOOKMARK_COLLECTIONS_PAGE_LIMIT,
			postId,
			q: debouncedSearch,
			enabled: modal.visible,
		});
		const { ref: observerTargetRef, isIntersecting: isTargetIntersecting } =
			useIntersectionObserver({
				root: scrollContainer,
				rootMargin: "100px",
			});

		const collections =
			collectionsQuery.data?.pages.flatMap(
				(page) => page.bookmarksCollections,
			) ?? [];
		const { fetchNextPage, hasNextPage, isFetchingNextPage } = collectionsQuery;

		useEffect(() => {
			if (
				!modal.visible ||
				!isTargetIntersecting ||
				!hasNextPage ||
				isFetchingNextPage
			)
				return;

			fetchNextPage();
		}, [
			modal.visible,
			isTargetIntersecting,
			hasNextPage,
			isFetchingNextPage,
			fetchNextPage,
		]);

		const close = () => {
			modal.resolve();
			modal.remove();
		};

		const isMutationPending =
			addBookmark.isPending ||
			removeBookmark.isPending ||
			removePostFromCollection.isPending;
		const pendingCollectionId = removePostFromCollection.isPending
			? removePostFromCollection.variables?.collectionId
			: addBookmark.variables?.collectionId;

		const handleToggleBookmark = async () => {
			if (isMutationPending) return;

			try {
				if (isBookmarked) {
					await removeBookmark.mutateAsync(postId);
					setIsBookmarked(false);
					await collectionsQuery.refetch();
				} else {
					await addBookmark.mutateAsync({ postId });
					setIsBookmarked(true);
				}
			} catch {}
		};

		const handleToggleCollection = async (collection: BookmarkCollection) => {
			if (isMutationPending) return;

			try {
				if (collection.isPostInCollection) {
					await removePostFromCollection.mutateAsync({
						postId,
						collectionId: collection.id,
					});
				} else {
					await addBookmark.mutateAsync({
						postId,
						collectionId: collection.id,
					});
					setIsBookmarked(true);
				}
				await collectionsQuery.refetch();
			} catch {}
		};

		const handleCreateCollection = () => {
			void NiceModal.show(BookmarkCollectionModal);
		};

		return (
			<Dialog
				open={modal.visible}
				onOpenChange={(open) => {
					if (!open) close();
				}}
			>
				<DialogContent size="md" aria-label="Bookmark collections">
					<DialogHeader className="pr-14">
						<div className="flex items-center justify-between gap-3">
							<DialogTitle>Manage bookmark collections</DialogTitle>
						</div>
					</DialogHeader>

					<DialogBody ref={setScrollContainer}>
						<div className="relative">
							<div className="sticky top-0 flex items-center gap-3 bg-white px-6 py-3">
								<input
									type="search"
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									placeholder="Search collections"
									aria-label="Search bookmark collections"
									className="h-8 min-w-0 flex-1 rounded bg-muted px-4 text-sm text-foreground outline-none transition focus:border focus:border-foreground"
								/>
								<IconButton
									type="button"
									size="sm"
									onClick={handleCreateCollection}
								>
									<RiAddLine className="size-6" />
								</IconButton>
							</div>
							<button
								type="button"
								onClick={() => void handleToggleBookmark()}
								disabled={isMutationPending}
								className="group flex min-h-16 w-full cursor-pointer items-center justify-between gap-3 border-b border-border px-6 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-60"
								aria-label={
									isBookmarked
										? "Remove from bookmarks"
										: "Save without a collection"
								}
								aria-pressed={isBookmarked}
							>
								<span className="min-w-0">
									<span className="block truncate text-base font-semibold">
										{isBookmarked
											? "Saved to bookmarks"
											: "Save without a collection"}
									</span>
									<span className="block truncate text-sm font-normal text-muted-foreground">
										{isBookmarked
											? "Remove this post from bookmarks and all collections."
											: "Save this post without choosing a collection."}
									</span>
								</span>
								{removeBookmark.isPending ? (
									<RiLoader4Line className="size-5 shrink-0 animate-spin text-muted-foreground" />
								) : isBookmarked ? (
									<RiBookmarkFill className="size-5 shrink-0 text-amber-500" />
								) : (
									<RiBookmarkLine className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-amber-500" />
								)}
							</button>
							{collectionsQuery.isLoading ? (
								<div className="space-y-1">
									{[1, 2, 3, 4].map((loaderId) => (
										<div
											className="flex justify-between items-center h-14 px-7"
											key={`collection-loader-${loaderId}`}
										>
											<Skeleton className="h-4 w-32" />
											<Skeleton className="size-6" />
										</div>
									))}
								</div>
							) : collectionsQuery.isError ? (
								<ExceptionBlock
									borderless
									className="px-6 py-8"
									title="Unable to load collections"
									description="Something went wrong while loading your bookmark collections."
									onRefresh={() => void collectionsQuery.refetch()}
									isRefetching={collectionsQuery.isRefetching}
								/>
							) : collections.length === 0 ? (
								<EmptyBlock
									borderless
									className="px-6 py-8"
									title={
										debouncedSearch
											? "No bookmark collections found"
											: "No collections yet"
									}
									description={
										debouncedSearch
											? "Try a different search."
											: "Create a collection to organize your saved posts."
									}
								/>
							) : (
								<div>
									{collections.map((collection) => {
										const isLoading =
											isMutationPending &&
											pendingCollectionId === collection.id;
										return (
											<button
												key={collection.id}
												type="button"
												onClick={() => void handleToggleCollection(collection)}
												disabled={isLoading}
												className="group flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 px-6 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-60"
												aria-label={`${collection.isPostInCollection ? "Remove from" : "Save to"} ${collection.name}`}
												aria-pressed={collection.isPostInCollection}
											>
												<span className="min-w-0 truncate text-base font-semibold">
													{collection.name}
												</span>
												{isLoading ? (
													<RiLoader4Line className="size-5 shrink-0 animate-spin text-muted-foreground" />
												) : collection.isPostInCollection ? (
													<RiBookmarkFill className="size-5 shrink-0 text-amber-500" />
												) : (
													<RiBookmarkLine className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-amber-500" />
												)}
											</button>
										);
									})}
								</div>
							)}

							{hasNextPage ? (
								<div ref={observerTargetRef} className="min-h-8 pt-1">
									<div className="flex justify-center py-2">
										<RiLoader4Line className="size-5 animate-spin text-muted-foreground" />
									</div>
								</div>
							) : null}
						</div>
					</DialogBody>
				</DialogContent>
			</Dialog>
		);
	});

export { BookmarkCollectionPickerModal };
