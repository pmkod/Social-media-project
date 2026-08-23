import { RiBookmarkFill, RiBookmarkLine } from "@remixicon/react";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { BookmarkCollectionPickerModal } from "./bookmark-collection-picker-modal.tsx";

type BookmarkButtonProps = {
	postId: string;
	isBookmarked: boolean;
};

function BookmarkButton({ postId, isBookmarked }: BookmarkButtonProps) {
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		event.preventDefault();

		void NiceModal.show(BookmarkCollectionPickerModal, {
			postId,
		});
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label="Manage bookmark collections"
			className={`group -mr-2 flex cursor-pointer items-center gap-1.5 rounded-full p-2 transition-colors hover:bg-accent disabled:cursor-default disabled:opacity-60 ${
				isBookmarked ? "text-amber-500" : "hover:text-amber-500"
			}`}
		>
			{isBookmarked ? (
				<RiBookmarkFill className="size-6 text-amber-500" />
			) : (
				<RiBookmarkLine className="size-6" />
			)}
		</button>
	);
}

export { BookmarkButton };
