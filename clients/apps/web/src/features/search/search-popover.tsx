import { RiCloseLine, RiSearchLine } from "@remixicon/react";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserRowItemListLoader } from "@/features/user/common/components/user-row-item-list-loader.tsx";
import type { User } from "@/features/user/common/user.ts";
import { UserProfileLink } from "@/features/user/common/user-profile-link.tsx";
import { useSearchUsers } from "@/features/user/search/use-search-users.ts";
import { useClearSearchHistory } from "./use-clear-search-history.ts";
import { useDeleteSearchHistoryItem } from "./use-delete-search-history-item.ts";
import { useSearchHistory } from "./use-search-history.ts";
import { useSearchSuggestions } from "./use-search-suggestions.ts";

type SearchPopoverProps = {
	query: string;
	debouncedQuery: string;
	onSelectText: (text: string) => void;
	onSelectUser: (user: User) => void;
};

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
			className="flex min-w-0 flex-1 items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/60"
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

function SearchPopover({
	query,
	debouncedQuery,
	onSelectText,
	onSelectUser,
}: SearchPopoverProps) {
	const normalizedQuery = query.trim();
	const normalizedDebouncedQuery = debouncedQuery.trim();
	const isDebouncedQueryCurrent =
		normalizedQuery.toLowerCase() === normalizedDebouncedQuery.toLowerCase();
	const suggestionsQuery = useSearchSuggestions(normalizedDebouncedQuery);
	const usersQuery = useSearchUsers({
		query: normalizedDebouncedQuery,
		limit: 5,
		enabled: normalizedQuery.length > 0,
	});
	const historyQuery = useSearchHistory(20, normalizedQuery.length === 0);
	const deleteHistoryItem = useDeleteSearchHistoryItem();
	const clearHistory = useClearSearchHistory();

	if (normalizedQuery.length > 0) {
		const apiSuggestions = isDebouncedQueryCurrent
			? (suggestionsQuery.data?.suggestions ?? [])
			: [];
		const suggestions = [normalizedQuery, ...apiSuggestions].filter(
			(suggestion, index, allSuggestions) =>
				suggestion.trim().length > 0 &&
				allSuggestions.findIndex(
					(candidate) =>
						candidate.trim().toLowerCase() === suggestion.trim().toLowerCase(),
				) === index,
		);
		const users = isDebouncedQueryCurrent
			? (usersQuery.data?.pages.flatMap((page) => page.users) ?? [])
			: [];

		return (
			<div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[min(32rem,70vh)] overflow-y-auto rounded-xl border border-border bg-background shadow-lg">
				<div>
					{suggestions.map((suggestion) => (
						<button
							type="button"
							key={suggestion.toLowerCase()}
							onClick={() => onSelectText(suggestion)}
							className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
						>
							<RiSearchLine className="size-5 shrink-0 text-muted-foreground" />
							<span className="truncate">{suggestion}</span>
						</button>
					))}
				</div>

				<div className="border-t border-border">
					{!isDebouncedQueryCurrent || usersQuery.isLoading ? (
						<UserRowItemListLoader count={3} />
					) : usersQuery.isError ? (
						<p className="px-5 py-4 text-sm text-muted-foreground">
							Unable to load people.
						</p>
					) : users.length === 0 ? (
						<p className="px-5 py-4 text-sm text-muted-foreground">
							No people found.
						</p>
					) : (
						users
							.slice(0, 5)
							.map((user) => (
								<SearchUserLink
									key={user.id}
									user={user}
									onClick={() => onSelectUser(user)}
								/>
							))
					)}
				</div>
			</div>
		);
	}

	const history =
		historyQuery.data?.pages.flatMap((page) => page.history) ?? [];

	return (
		<div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[min(32rem,70vh)] overflow-y-auto rounded-xl border border-border bg-background shadow-lg">
			<div className="flex items-center justify-between gap-4 px-5 py-4">
				<h2 className="text-lg font-semibold text-foreground">Recent</h2>
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
							className="flex items-center transition-colors hover:bg-muted/60"
						>
							{item.user ? (
								<SearchUserLink
									user={item.user}
									onClick={() => onSelectUser(item.user as User)}
								/>
							) : (
								<button
									type="button"
									onClick={() => item.text && onSelectText(item.text)}
									className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-5 py-4 text-left text-sm font-medium text-foreground"
								>
									<RiSearchLine className="size-5 shrink-0 text-muted-foreground" />
									<span className="truncate">{item.text}</span>
								</button>
							)}
							<button
								type="button"
								aria-label="Remove from recent searches"
								disabled={deleteHistoryItem.isPending}
								onClick={() => deleteHistoryItem.mutate(item.id)}
								className="mr-3 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:cursor-default disabled:opacity-50"
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
							className="w-full cursor-pointer border-t border-border px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-muted/60 disabled:cursor-default disabled:opacity-50"
						>
							{historyQuery.isFetchingNextPage ? "Loading…" : "Show more"}
						</button>
					) : null}
				</div>
			)}
		</div>
	);
}

export { SearchPopover };
