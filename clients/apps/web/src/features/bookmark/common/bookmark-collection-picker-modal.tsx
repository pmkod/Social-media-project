import { RiAddLine, RiBookmarkLine, RiLoader4Line } from "@remixicon/react";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import NiceModal, {
	create,
	useModal,
} from "@/core/components/ui/nice-modal.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { useAddBookmark } from "../use-add-bookmark.ts";
import { useBookmarkCollections } from "../use-bookmark-collections.ts";
import { BOOKMARK_COLLECTIONS_PAGE_LIMIT } from "./bookmark-collection.constants.ts";
import type { BookmarkCollection } from "./bookmark-collection.ts";
import { BookmarkCollectionModal } from "./bookmark-collection-modal.tsx";

type BookmarkCollectionPickerModalProps = {
	postId: string;
};

const BookmarkCollectionPickerModal =
	create<BookmarkCollectionPickerModalProps>(({ postId }) => {
		const modal = useModal();
		const addBookmark = useAddBookmark();
		const [scrollContainer, setScrollContainer] =
			useState<HTMLDivElement | null>(null);
		const collectionsQuery = useBookmarkCollections({
			limit: BOOKMARK_COLLECTIONS_PAGE_LIMIT,
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

		const handleSelectCollection = async (collection: BookmarkCollection) => {
			if (addBookmark.isPending) return;

			try {
				await addBookmark.mutateAsync({
					postId,
					collectionId: collection.id,
				});
				modal.resolve(collection);
				modal.remove();
			} catch {
				// The mutation error is displayed in the modal.
			}
		};

		const handleCreateCollection = () => {
			close();
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
							<DialogTitle>Choose a collection</DialogTitle>
							<button
								type="button"
								onClick={handleCreateCollection}
								aria-label="Create collection"
								className="cursor-pointer rounded-full p-1.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<RiAddLine className="size-6" />
							</button>
						</div>
					</DialogHeader>

					<DialogBody ref={setScrollContainer} className="px-3 py-3">
						{collectionsQuery.isLoading ? (
							<div className="space-y-1">
								{[1, 2, 3, 4].map((loaderId) => (
									<div
										key={`collection-loader-${loaderId}`}
										className="h-14 animate-pulse rounded-xl bg-muted"
									/>
								))}
							</div>
						) : collectionsQuery.isError ? (
							<div className="px-2 py-8 text-center">
								<p className="text-sm text-muted-foreground">
									Unable to load your collections.
								</p>
								<button
									type="button"
									onClick={() => void collectionsQuery.refetch()}
									className="mt-3 cursor-pointer text-sm font-semibold text-foreground underline underline-offset-4"
								>
									Try again
								</button>
							</div>
						) : collections.length === 0 ? (
							<p className="px-2 py-8 text-center text-sm text-muted-foreground">
								No collections yet. Create one with +.
							</p>
						) : (
							<div className="space-y-1">
								{collections.map((collection) => (
									<button
										key={collection.id}
										type="button"
										onClick={() => void handleSelectCollection(collection)}
										disabled={addBookmark.isPending}
										className="group flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-60"
										aria-label={`Save to ${collection.name}`}
									>
										<span className="min-w-0 truncate text-base font-semibold">
											{collection.name}
										</span>
										{addBookmark.isPending ? (
											<RiLoader4Line className="size-5 shrink-0 animate-spin text-muted-foreground" />
										) : (
											<RiBookmarkLine className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-amber-500" />
										)}
									</button>
								))}
							</div>
						)}

						{addBookmark.isError ? (
							<p
								className="px-2 pb-2 pt-3 text-sm text-destructive"
								role="alert"
							>
								Unable to add this post to the collection. Please try again.
							</p>
						) : null}

						{hasNextPage ? (
							<div ref={observerTargetRef} className="min-h-8 pt-1">
								{isFetchingNextPage ? (
									<div className="flex justify-center py-2">
										<RiLoader4Line className="size-5 animate-spin text-muted-foreground" />
									</div>
								) : null}
							</div>
						) : null}
					</DialogBody>
				</DialogContent>
			</Dialog>
		);
	});

export { BookmarkCollectionPickerModal };
export type { BookmarkCollectionPickerModalProps };
