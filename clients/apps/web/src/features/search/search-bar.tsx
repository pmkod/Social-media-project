import { useDebounceValue } from "@/core/hooks/use-debounce-value";
import { RiSearchLine } from "@remixicon/react";
import { useState } from "react";

const SearchBar = () => {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounceValue(search.trim(), 350);

	return (
		<div className="relative block">
			<RiSearchLine className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
			<input
				type="search"
				value={search}
				onChange={(event) => setSearch(event.target.value)}
				placeholder="Search posts"
				aria-label="Search posts"
				className="h-12 w-full rounded-full border border-transparent bg-muted pl-12 pr-5 text-sm text-foreground outline-none transition focus:border-foreground"
			/>
		</div>
	);
};
export { SearchBar };
