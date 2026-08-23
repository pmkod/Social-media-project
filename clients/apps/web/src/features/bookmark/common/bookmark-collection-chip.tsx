import { cn } from "@/core/lib/utils.ts";

type BookmarkCollectionChipProps = {
	name: string;
	isSelected: boolean;
	onClick: () => void;
};

function BookmarkCollectionChip({
	name,
	isSelected,
	onClick,
}: BookmarkCollectionChipProps) {
	return (
		<button
			type="button"
			aria-pressed={isSelected}
			onClick={onClick}
			className={cn(
				"max-w-52 shrink-0 truncate rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
				isSelected
					? "bg-foreground text-background hover:bg-foreground/90"
					: "bg-muted text-foreground hover:bg-muted/80",
			)}
		>
			{name}
		</button>
	);
}

export { BookmarkCollectionChip };
export type { BookmarkCollectionChipProps };
