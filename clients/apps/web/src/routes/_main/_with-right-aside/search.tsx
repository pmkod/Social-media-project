import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { useDebounceValue } from "@/core/hooks/use-debounce-value.ts";
import { SearchBar } from "@/features/search/search-bar.tsx";
import { SearchPopover } from "@/features/search/search-popover.tsx";
import { SearchResults } from "@/features/search/search-results.tsx";
import { useCreateSearchHistory } from "@/features/search/use-create-search-history.ts";
import type { User } from "@/features/user/common/user.ts";

const searchPageSearchParams = z.object({
	q: z.string().trim().max(100).optional(),
});

export const Route = createFileRoute("/_main/_with-right-aside/search")({
	validateSearch: searchPageSearchParams,
	component: SearchPage,
});

function SearchPage() {
	const { q } = Route.useSearch();
	const navigate = Route.useNavigate();
	const committedQuery = q?.trim() ?? "";
	const [search, setSearch] = useState(committedQuery);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [debouncedSearch] = useDebounceValue(search, 350);
	const searchAreaRef = useRef<HTMLDivElement>(null);
	const createSearchHistory = useCreateSearchHistory();

	useEffect(() => {
		setSearch(committedQuery);
	}, [committedQuery]);

	useEffect(() => {
		const closePopoverOnOutsidePointerDown = (event: PointerEvent) => {
			if (
				searchAreaRef.current &&
				!searchAreaRef.current.contains(event.target as Node)
			) {
				setIsPopoverOpen(false);
			}
		};

		document.addEventListener("pointerdown", closePopoverOnOutsidePointerDown);
		return () =>
			document.removeEventListener(
				"pointerdown",
				closePopoverOnOutsidePointerDown,
			);
	}, []);

	const selectTextSearch = (text: string) => {
		const normalizedText = text.trim();
		if (!normalizedText) return;

		setSearch(normalizedText);
		setIsPopoverOpen(false);
		createSearchHistory.mutate({ text: normalizedText });
		void navigate({ search: { q: normalizedText } });
	};

	const selectUserSearch = (user: User) => {
		setIsPopoverOpen(false);
		createSearchHistory.mutate({ userId: user.id });
	};

	return (
		<MainContainer>
			<div ref={searchAreaRef} className="relative py-5">
				<SearchBar
					value={search}
					maxLength={100}
					onFocus={() => setIsPopoverOpen(true)}
					onChange={(event) => {
						setSearch(event.target.value);
						setIsPopoverOpen(true);
					}}
					onKeyDown={(event) => {
						if (event.key === "Escape") {
							setIsPopoverOpen(false);
							event.currentTarget.blur();
						}
						if (event.key === "Enter") {
							event.preventDefault();
							selectTextSearch(search);
						}
					}}
				/>

				{isPopoverOpen ? (
					<SearchPopover
						query={search}
						debouncedQuery={debouncedSearch}
						onSelectText={selectTextSearch}
						onSelectUser={selectUserSearch}
					/>
				) : null}
			</div>

			<SearchResults query={committedQuery} onSelectUser={selectUserSearch} />
		</MainContainer>
	);
}
