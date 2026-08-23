import {
	RiBookmarkFill,
	RiBookmarkLine,
	RiLoader4Line,
} from "@remixicon/react";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { useRemoveBookmark } from "../use-remove-bookmark.ts";
import { BookmarkCollectionPickerModal } from "./bookmark-collection-picker-modal.tsx";

type BookmarkButtonProps = {
	postId: string;
	isBookmarked: boolean;
};

function BookmarkButton({ postId, isBookmarked }: BookmarkButtonProps) {
	const removeBookmark = useRemoveBookmark();

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		event.preventDefault();

		if (removeBookmark.isPending) return;

		if (isBookmarked) {
			removeBookmark.mutate(postId);
			return;
		}

		void NiceModal.show(BookmarkCollectionPickerModal, { postId });
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={removeBookmark.isPending}
			aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
			className={`group -mr-2 flex cursor-pointer items-center gap-1.5 rounded-full p-2 transition-colors hover:bg-accent disabled:cursor-default disabled:opacity-60 ${
				isBookmarked ? "text-amber-500" : "hover:text-amber-500"
			}`}
		>
			{removeBookmark.isPending ? (
				<RiLoader4Line className="size-6 animate-spin" />
			) : isBookmarked ? (
				<RiBookmarkFill className="size-6 text-amber-500" />
			) : (
				<RiBookmarkLine className="size-6" />
			)}
		</button>
	);
}

export { BookmarkButton };
