import { RiCloseLine, RiSearchLine } from "@remixicon/react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useDebounceValue } from "@/core/hooks/use-debounce-value.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserRowItemListLoader } from "@/features/user/common/components/user-row-item-list-loader.tsx";
import type { User } from "@/features/user/common/user.ts";
import { UserProfileLink } from "@/features/user/common/user-profile-link.tsx";
import { useSearchUsers } from "@/features/user/search/use-search-users.ts";
import { useClearSearchHistory } from "./use-clear-search-history.ts";
import { useCreateSearchHistory } from "./use-create-search-history.ts";
import { useDeleteSearchHistoryItem } from "./use-delete-search-history-item.ts";
import { useSearchHistory } from "./use-search-history.ts";
import { useSearchSuggestions } from "./use-search-suggestions.ts";

function SearchUserLink({
	user,
	onClick,
}: {
	user: User;
	onClick: () => void;
}) {
	return (
		<UserProfileLink
			user={user}
			onClick={onClick}
			className="flex min-w-0 flex-1 items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/30"
		>
			<UserAvatar user={user} size="md" />
			<span className="min-w-0">
				<span className="block truncate text-sm font-semibold text-foreground">
					{user.fullName}
				</span>
				<span className="block truncate text-sm text-muted-foreground">
					@{user.username}
				</span>
			</span>
		</UserProfileLink>
	);
}

function SearchBar() {
	const { q } = useSearch({ from: "/_main/_with-right-aside/search" });
	const [search, setSearch] = useState(q ?? "");
	const [debouncedSearch] = useDebounceValue(search, 350);
	const searchTerm = search.trim();
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const navigate = useNavigate();
	const searchAreaRef = useRef<HTMLDivElement>(null);
	const isSearchCurrent =
		searchTerm.toLowerCase() === debouncedSearch.trim().toLowerCase();
	const suggestionsQuery = useSearchSuggestions(debouncedSearch);
	const usersQuery = useSearchUsers({
		query: debouncedSearch,
		limit: 5,
		enabled: searchTerm.length > 0,
	});
	const historyQuery = useSearchHistory(20, searchTerm.length === 0);
	const deleteHistoryItem = useDeleteSearchHistoryItem();
	const clearHistory = useClearSearchHistory();
	const createSearchHistory = useCreateSearchHistory();

	useEffect(() => {
		setSearch(q ?? "");
	}, [q]);

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

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
		setIsPopoverOpen(true);
	};

	const handleSelectText = (text: string) => {
		const normalizedText = text.trim();
		if (!normalizedText) return;

		setIsPopoverOpen(false);
		setSearch(normalizedText);
		createSearchHistory.mutate({ text: normalizedText });
		void navigate({ to: "/search", search: { q: normalizedText } });
	};

	const handleSelectUser = (user: User) => {
		setIsPopoverOpen(false);
		createSearchHistory.mutate({ userId: user.id });
	};

	const suggestions =
		searchTerm.length > 0
			? [
					searchTerm,
					...(isSearchCurrent
						? (suggestionsQuery.data?.suggestions ?? [])
						: []),
				].filter(
					(suggestion, index, allSuggestions) =>
						suggestion.trim().length > 0 &&
						allSuggestions.findIndex(
							(candidate) =>
								candidate.trim().toLowerCase() ===
								suggestion.trim().toLowerCase(),
						) === index,
				)
			: [];

	const users = isSearchCurrent
		? (usersQuery.data?.pages.flatMap((page) => page.users) ?? [])
		: [];
	const history =
		historyQuery.data?.pages.flatMap((page) => page.history) ?? [];

	return (
		<div ref={searchAreaRef} className="relative block">
			<RiSearchLine className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
			<input
				type="search"
				placeholder="Search posts"
				aria-label="Search posts"
				className="h-12 w-full rounded-full border border-transparent bg-muted pl-12 pr-5 text-sm text-foreground outline-none transition focus:border-foreground"
				value={search}
				maxLength={100}
				onChange={handleChange}
				onFocus={() => setIsPopoverOpen(true)}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						setIsPopoverOpen(false);
						event.currentTarget.blur();
					}
					if (event.key === "Enter") {
						event.preventDefault();
						handleSelectText(search);
					}
				}}
			/>

			{isPopoverOpen ? (
				<div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[min(32rem,70vh)] overflow-y-auto rounded-xl border border-border bg-background shadow-lg">
					{searchTerm.length > 0 ? (
						<>
							<div>
								{suggestions.map((suggestion) => (
									<button
										type="button"
										key={suggestion.toLowerCase()}
										onClick={() => handleSelectText(suggestion)}
										className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
									>
										<div className="border rounded-full size-10 flex items-center justify-center">
											<RiSearchLine className="size-5 shrink-0 text-muted-foreground" />
										</div>
										<span className="truncate">{suggestion}</span>
									</button>
								))}
							</div>

							<div className="border-t border-border">
								{!isSearchCurrent || usersQuery.isLoading ? (
									<UserRowItemListLoader count={3} />
								) : usersQuery.isError ? (
									<p className="px-5 py-4 text-sm text-muted-foreground">
										Unable to load people.
									</p>
								) : users.length === 0 ? null : (
									users
										.slice(0, 5)
										.map((user) => (
											<SearchUserLink
												key={user.id}
												user={user}
												onClick={() => handleSelectUser(user)}
											/>
										))
								)}
							</div>
						</>
					) : (
						<>
							<div className="flex items-center justify-between gap-4 px-5 py-4">
								<h2 className="text-lg font-semibold text-foreground">
									Recent
								</h2>
								{history.length > 0 ? (
									<button
										type="button"
										disabled={clearHistory.isPending}
										onClick={() => clearHistory.mutate()}
										className="cursor-pointer text-sm font-semibold text-primary transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-50"
									>
										Clear all
									</button>
								) : null}
							</div>

							{historyQuery.isLoading ? (
								<UserRowItemListLoader count={4} />
							) : historyQuery.isError ? (
								<div className="px-5 pb-5 text-sm text-muted-foreground">
									<p>Unable to load recent searches.</p>
									<button
										type="button"
										onClick={() => void historyQuery.refetch()}
										className="mt-2 cursor-pointer font-semibold text-primary"
									>
										Try again
									</button>
								</div>
							) : history.length === 0 ? (
								<p className="px-5 pb-6 text-sm text-muted-foreground">
									No recent searches.
								</p>
							) : (
								<div>
									{history.map((item) => (
										<div
											key={item.id}
											className="relative flex items-center transition-colors hover:bg-muted/30"
										>
											{item.user ? (
												<SearchUserLink
													user={item.user}
													onClick={() => handleSelectUser(item.user as User)}
												/>
											) : (
												<button
													type="button"
													onClick={() =>
														item.text && handleSelectText(item.text)
													}
													className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-5 py-4 text-left text-sm font-medium text-foreground"
												>
													<div className="border rounded-full size-10 flex items-center justify-center">
														<RiSearchLine className="size-5 shrink-0 text-muted-foreground" />
													</div>
													<span className="truncate">{item.text}</span>
												</button>
											)}
											<button
												type="button"
												aria-label="Remove from recent searches"
												disabled={deleteHistoryItem.isPending}
												onClick={() => deleteHistoryItem.mutate(item.id)}
												className=" absolute right-3 top-1/2 transform -translate-y-1/2 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-primary transition-colors disabled:cursor-default disabled:opacity-50"
											>
												<RiCloseLine className="size-5" />
											</button>
										</div>
									))}

									{historyQuery.hasNextPage ? (
										<button
											type="button"
											disabled={historyQuery.isFetchingNextPage}
											onClick={() => void historyQuery.fetchNextPage()}
											className="w-full cursor-pointer border-t border-border px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-muted/30 disabled:cursor-default disabled:opacity-50"
										>
											{historyQuery.isFetchingNextPage
												? "Loading…"
												: "Show more"}
										</button>
									) : null}
								</div>
							)}
						</>
					)}
				</div>
			) : null}
		</div>
	);
}

export { SearchBar };
