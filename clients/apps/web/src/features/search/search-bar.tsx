import { RiSearchLine } from "@remixicon/react";
import type { ComponentProps } from "react";

type SearchBarProps = Omit<ComponentProps<"input">, "className" | "type">;

const SearchBar = ({
	placeholder = "Search posts",
	"aria-label": ariaLabel = "Search posts",
	...props
}: SearchBarProps) => {
	return (
		<div className="relative block">
			<RiSearchLine className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
			<input
				type="search"
				placeholder={placeholder}
				aria-label={ariaLabel}
				className="h-12 w-full rounded-full border border-transparent bg-muted pl-12 pr-5 text-sm text-foreground outline-none transition focus:border-foreground"
				{...props}
			/>
		</div>
	);
};

export { SearchBar };
