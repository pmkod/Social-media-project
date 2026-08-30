import {
	RiCheckLine,
	RiLoader4Line,
	RiSearchLine,
	RiUserSearchLine,
} from "@remixicon/react";
import { useDeferredValue, useId, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { Input } from "@/core/components/ui/input.tsx";
import { cn } from "@/core/lib/utils.ts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserRowItemListLoader } from "@/features/user/common/components/user-row-item-list-loader.tsx";
import type { User } from "@/features/user/common/user.ts";
import { useSearchUsers } from "@/features/user/search/use-search-users.ts";

type DiscussionUserPickerProps = {
	selectedUserIds?: string[];
	onSelect: (user: User) => void;
	pendingUserId?: string | null;
	disabled?: boolean;
	autoFocus?: boolean;
};

function DiscussionUserPicker({
	selectedUserIds = [],
	onSelect,
	pendingUserId,
	disabled = false,
	autoFocus = true,
}: DiscussionUserPickerProps) {
	const [query, setQuery] = useState("");
	const searchInputId = useId();
	const deferredQuery = useDeferredValue(query.trim());
	const authenticatedUser = useAuthenticatedUser();
	const usersQuery = useSearchUsers({
		query: deferredQuery,
		limit: 10,
		enabled: deferredQuery.length >= 2,
	});
	const users =
		usersQuery.data?.pages
			.flatMap((page) => page.users)
			.filter((user) => user.id !== authenticatedUser.data?.user.id) ?? [];

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<label
				htmlFor={searchInputId}
				className="relative block shrink-0 px-5 py-4"
			>
				<span className="sr-only">Search people</span>
				<RiSearchLine className="pointer-events-none absolute left-8 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					id={searchInputId}
					type="search"
					size="lg"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search by name or username"
					className="rounded-full bg-muted/60 pl-10 shadow-none"
					autoFocus={autoFocus}
					disabled={disabled}
				/>
			</label>

			<div className="min-h-56 flex-1 overflow-y-auto border-t border-border">
				{deferredQuery.length < 2 ? (
					<div className="flex min-h-56 items-center justify-center px-5">
						<div className="text-center">
							<RiUserSearchLine className="mx-auto size-7 text-muted-foreground" />
							<p className="mt-3 text-sm font-medium">
								Find someone to message
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Enter at least two characters to search.
							</p>
						</div>
					</div>
				) : usersQuery.isLoading ? (
					<UserRowItemListLoader count={5} />
				) : usersQuery.isError ? (
					<ExceptionBlock
						borderless
						className="min-h-56"
						title="Unable to search people"
						description="An error occurred while searching. Please try again."
						onRefresh={() => void usersQuery.refetch()}
						isRefetching={usersQuery.isRefetching}
					/>
				) : users.length === 0 ? (
					<EmptyBlock
						borderless
						className="min-h-56"
						title="No people found"
						description={`No account matches “${deferredQuery}”.`}
					/>
				) : (
					<div className="divide-y divide-border/70">
						{users.map((user) => {
							const isSelected = selectedUserIds.includes(user.id);
							const isBlocked =
								user.isBlockedByAuthenticatedUser ||
								user.hasBlockedAuthenticatedInUser;
							const isPending = pendingUserId === user.id;

							return (
								<button
									key={user.id}
									type="button"
									onClick={() => onSelect(user)}
									disabled={disabled || Boolean(isBlocked)}
									className={cn(
										"flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition hover:bg-accent/70 disabled:cursor-not-allowed disabled:opacity-55",
										isSelected && "bg-primary/6",
									)}
								>
									<UserAvatar user={user} size="md" />
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-semibold">
											{user.fullName || `@${user.username}`}
										</p>
										<p className="truncate text-xs text-muted-foreground">
											{isBlocked
												? "Messaging unavailable"
												: `@${user.username}`}
										</p>
									</div>
									{isPending ? (
										<RiLoader4Line className="size-5 animate-spin text-primary" />
									) : isSelected ? (
										<span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
											<RiCheckLine className="size-4" />
										</span>
									) : null}
								</button>
							);
						})}

						{usersQuery.hasNextPage ? (
							<div className="p-3">
								<Button
									type="button"
									variant="ghost"
									fullWidth
									isLoading={usersQuery.isFetchingNextPage}
									onClick={() => void usersQuery.fetchNextPage()}
								>
									Show more people
								</Button>
							</div>
						) : null}
					</div>
				)}
			</div>
		</div>
	);
}

export { DiscussionUserPicker };
