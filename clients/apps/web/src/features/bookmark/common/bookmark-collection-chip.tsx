import { RiDeleteBinLine, RiEdit2Line } from "@remixicon/react";
import type { MouseEvent } from "react";
import { cn } from "@/core/lib/utils.ts";

type BookmarkCollectionChipProps = {
	name: string;
	isSelected: boolean;
	onClick: () => void;
	onEdit?: () => void;
	onDelete?: () => void | Promise<void>;
};

function BookmarkCollectionChip({
	name,
	isSelected,
	onClick,
	onEdit,
	onDelete,
}: BookmarkCollectionChipProps) {
	const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		onEdit?.();
	};

	const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		onDelete?.();
	};

	return (
		<button
			type="button"
			aria-pressed={isSelected}
			onClick={onClick}
			className={cn(
				"flex max-w-52 shrink-0 cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-sm font-medium transition-colors",
				isSelected
					? "bg-foreground text-background hover:bg-foreground/90"
					: "bg-muted text-foreground hover:bg-muted/80",
			)}
		>
			<div className="min-w-0 flex-1 truncate rounded-full px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset">
				{name}
			</div>
			{onEdit ? (
				<button
					type="button"
					aria-label={`Edit ${name}`}
					onClick={handleEdit}
					className="shrink-0 cursor-pointer rounded-full p-1 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current dark:hover:bg-white/10"
				>
					<RiEdit2Line className="size-4" />
				</button>
			) : null}
			{onDelete ? (
				<button
					type="button"
					aria-label={`Delete ${name}`}
					onClick={handleDelete}
					className="shrink-0 cursor-pointer rounded-full p-1 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current dark:hover:bg-white/10"
				>
					<RiDeleteBinLine className="size-4" />
				</button>
			) : null}
		</button>
	);
}

export { BookmarkCollectionChip };
