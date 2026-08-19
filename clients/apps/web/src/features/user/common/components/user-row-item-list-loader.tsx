import { cn } from "@/core/lib/utils.ts";
import { UserRowItemLoader } from "./user-row-item-loader.tsx";

type UserRowItemListLoaderProps = {
	count?: number;
	className?: string;
};

function UserRowItemListLoader({
	count = 7,
	className,
}: UserRowItemListLoaderProps) {
	return (
		<div className={cn(className)}>
			{Array.from({ length: count }).map((_, index) => (
				<UserRowItemLoader
					// biome-ignore lint/suspicious/noArrayIndexKey: Static array for skeleton loading placeholders
					key={index}
				/>
			))}
		</div>
	);
}

export { UserRowItemListLoader };
export type { UserRowItemListLoaderProps };
