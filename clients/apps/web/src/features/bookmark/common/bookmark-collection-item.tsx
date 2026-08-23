import { RiDeleteBinLine, RiEdit2Line } from "@remixicon/react";
import type { MouseEvent } from "react";
import { cn } from "@/core/lib/utils.ts";

type BookmarkCollectionItemProps = {
	name: string;
	isSelected: boolean;
	onClick: () => void;
	onEdit?: () => void;
	onDelete?: () => void | Promise<void>;
	className?: string;
};

function BookmarkCollectionItem({
	name,
	isSelected,
	onClick,
	onEdit,
	onDelete,
	className,
}: BookmarkCollectionItemProps) {
	const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		onEdit?.();
	};

	const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		void onDelete?.();
	};

	return (
		<button
			className={cn(
				"flex flex-col items-start justify-start min-h-24 rounded-lg px-4 py-3 cursor-pointer transition-colors",
				isSelected
					? "bg-foreground text-background hover:bg-foreground/90"
					: "bg-muted text-foreground hover:bg-muted/80",
				className,
			)}
			onClick={onClick}
			type="button"
			aria-pressed={isSelected}
			aria-label={`Open ${name}`}
		>
			<p className="text-xl font-semibold text-start">{name}</p>

			{onEdit || onDelete ? (
				<div className="mt-auto w-max self-end gap-1 pt-4">
					{onEdit ? (
						<button
							type="button"
							aria-label={`Edit ${name}`}
							onClick={handleEdit}
							className="cursor-pointer rounded-md p-1.5 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current dark:hover:bg-white/10"
						>
							<RiEdit2Line className="size-5" />
						</button>
					) : null}
					{onDelete ? (
						<button
							type="button"
							aria-label={`Delete ${name}`}
							onClick={handleDelete}
							className="cursor-pointer rounded-md p-1.5 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current dark:hover:bg-white/10"
						>
							<RiDeleteBinLine className="size-5" />
						</button>
					) : null}
				</div>
			) : null}
		</button>
	);
}

export { BookmarkCollectionItem };
