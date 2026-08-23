import {
	RiAddLine,
	RiBookmarkFill,
	RiBookmarkLine,
	RiLoader4Line,
} from "@remixicon/react";
import { useEffect, useState } from "react";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import {
	Popover,
	PopoverArrow,
	PopoverContent,
	PopoverTrigger,
} from "@/core/components/ui/popover.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { useAddBookmark } from "../use-add-bookmark.ts";
import { useBookmarkCollections } from "../use-bookmark-collections.ts";
import { useRemoveBookmark } from "../use-remove-bookmark.ts";
import { BOOKMARK_COLLECTIONS_PAGE_LIMIT } from "./bookmark-collection.constants.ts";
import type { BookmarkCollection } from "./bookmark-collection.ts";
import { BookmarkCollectionModal } from "./bookmark-collection-modal.tsx";

type BookmarkCollectionPopoverProps = {
	postId: string;
	isBookmarked: boolean;
};

function BookmarkCollectionPopover({
	postId,
	isBookmarked,
}: BookmarkCollectionPopoverProps) {
	const [open, setOpen] = useState(false);
	const addBookmark = useAddBookmark();
	const removeBookmark = useRemoveBookmark();
	const collectionsQuery = useBookmarkCollections({
		limit: BOOKMARK_COLLECTIONS_PAGE_LIMIT,
		enabled: open,
	});
	const { ref: observerTargetRef, isIntersecting: isTargetIntersecting } =
		useIntersectionObserver({ rootMargin: "100px" });

	const collections =
		collectionsQuery.data?.pages.flatMap((page) => page.bookmarksCollections) ??
		[];
	const isMutationPending = addBookmark.isPending || removeBookmark.isPending;

	useEffect(() => {
		if (
			!open ||
			!isTargetIntersecting ||
			!collectionsQuery.hasNextPage ||
			collectionsQuery.isFetchingNextPage
		)
			return;

		collectionsQuery.fetchNextPage();
	}, [
		open,
		isTargetIntersecting,
		collectionsQuery.fetchNextPage,
		collectionsQuery.hasNextPage,
		collectionsQuery.isFetchingNextPage,
	]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (isBookmarked && nextOpen) return;
		setOpen(nextOpen);
	};

	const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		event.preventDefault();

		// if (!isBookmarked) return;

		// if (!isMutationPending) removeBookmark.mutate(postId);
	};

	const handleSelectCollection = (collection: BookmarkCollection) => {
		if (isMutationPending) return;

		addBookmark.mutate(
			{ postId, collectionId: collection.id },
			{ onSuccess: () => setOpen(false) },
		);
	};

	const handleCreateCollection = () => {
		setOpen(false);
		void NiceModal.show(BookmarkCollectionModal);
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<button
					type="button"
					// onClick={handleTriggerClick}
					disabled={isMutationPending}
					aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
					className={`cursor-pointer flex items-center gap-1.5 transition-colors group -mr-2 rounded-full p-2 hover:bg-accent disabled:cursor-default disabled:opacity-60 ${
						isBookmarked ? "text-amber-500" : "hover:text-amber-500"
					}`}
				>
					{isBookmarked ? (
						<RiBookmarkFill className="size-6 text-amber-500" />
					) : (
						<RiBookmarkLine className="size-6" />
					)}
				</button>
			</PopoverTrigger>

			<PopoverContent
				side="top"
				align="end"
				className="overflow-hidden p-0"
				aria-label="Bookmark collections"
			>
				<div className="flex max-h-[min(28rem,calc(100dvh-2rem))] min-h-0 flex-col">
					<div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4">
						<h2 className="text-xl font-bold">Collections</h2>
						<button
							type="button"
							onClick={handleCreateCollection}
							aria-label="Create collection"
							className="cursor-pointer rounded-full p-1.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<RiAddLine className="size-6" />
						</button>
					</div>

					<div className="min-h-0 overflow-y-auto overscroll-contain px-3 pb-3">
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
							<div className="px-2 py-6 text-center">
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
							<p className="px-2 py-6 text-center text-sm text-muted-foreground">
								No collections yet. Create one with +.
							</p>
						) : (
							<div className="space-y-1">
								{collections.map((collection) => (
									<button
										key={collection.id}
										type="button"
										onClick={() => handleSelectCollection(collection)}
										disabled={isMutationPending}
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

						{collectionsQuery.hasNextPage ? (
							<div ref={observerTargetRef} className="min-h-8 pt-1">
								{collectionsQuery.isFetchingNextPage ? (
									<div className="flex justify-center py-2">
										<RiLoader4Line className="size-5 animate-spin text-muted-foreground" />
									</div>
								) : null}
							</div>
						) : null}
					</div>
				</div>
				<PopoverArrow />
			</PopoverContent>
		</Popover>
	);
}

export { BookmarkCollectionPopover };
export type { BookmarkCollectionPopoverProps };
