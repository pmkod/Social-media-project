import { RiLoader4Line, RiUserSearchLine } from "@remixicon/react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, AlertDescription } from "@/core/components/ui/alert.tsx";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { SearchInput } from "@/core/components/ui/search-input.tsx";
import { useDebounceValue } from "@/core/hooks/use-debounce-value.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserRowItemListLoader } from "@/features/user/common/components/user-row-item-list-loader.tsx";
import type { User } from "@/features/user/common/user.ts";
import { useSearchUsers } from "@/features/user/search/use-search-users.ts";
import { DiscussionTypes } from "../common/discussion.constants.ts";
import { useCreateDiscussion } from "../hooks/use-create-discussion.ts";

const StartDiscussionModal = create(() => {
	const modal = useModal();
	const navigate = useNavigate();
	const createDiscussion = useCreateDiscussion();
	const [query, setQuery] = useState("");
	const [pendingUserId, setPendingUserId] = useState<string | null>(null);
	const [debouncedQuery] = useDebounceValue(query.trim(), 500);
	// const authenticatedUser = useAuthenticatedUser();
	const isSearchEnabled = debouncedQuery.length >= 2;
	const usersQuery = useSearchUsers({
		query: debouncedQuery,
		limit: 10,
		enabled: isSearchEnabled,
	});
	const users = usersQuery.data?.pages.flatMap((page) => page.users) ?? [];

	const close = () => {
		if (createDiscussion.isPending) return;
		modal.resolve();
		modal.remove();
	};

	const startPrivateDiscussion = async (user: User) => {
		if (createDiscussion.isPending) return;
		setPendingUserId(user.id);
		try {
			const { discussion } = await createDiscussion.mutateAsync({
				type: DiscussionTypes.PRIVATE,
				memberIds: [user.id],
			});
			modal.resolve(discussion);
			modal.remove();
			await navigate({
				to: "/discussions/$discussionId",
				params: { discussionId: discussion.id },
			});
		} catch {
			setPendingUserId(null);
		}
	};

	return (
		<Dialog
			open={modal.visible}
			onOpenChange={(open) => {
				if (!open) close();
			}}
		>
			<DialogContent size="xl">
				<DialogHeader>
					<DialogTitle>New message</DialogTitle>
				</DialogHeader>

				<DialogBody>
					<div className="flex min-h-0 flex-col h-[min(42rem,calc(100dvh-20rem))]">
						<div className="shrink-0 px-5 py-4">
							<SearchInput
								label="Search people"
								size="lg"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search by name or username"
								autoFocus
								disabled={createDiscussion.isPending}
							/>
						</div>

						<div className="min-h-56 flex-1 overflow-y-auto border-t border-border">
							{createDiscussion.isError ? (
								<div className="px-5 my-3">
									<Alert colorScheme={"destructive"}>
										<AlertDescription>
											{createDiscussion.error instanceof Error &&
											createDiscussion.error.message
												? createDiscussion.error.message
												: "Unable to start this conversation."}
										</AlertDescription>
									</Alert>
								</div>
							) : null}
							{!isSearchEnabled ? (
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
									description={`No account matches “${debouncedQuery}”.`}
								/>
							) : (
								<div className="divide-y divide-border/70">
									{users.map((user) => {
										const isBlocked =
											user.isBlockedByAuthenticatedUser ||
											user.hasBlockedAuthenticatedInUser;
										const isPending = pendingUserId === user.id;

										return (
											<button
												key={user.id}
												type="button"
												onClick={() => void startPrivateDiscussion(user)}
												disabled={
													createDiscussion.isPending || Boolean(isBlocked)
												}
												className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition hover:bg-accent/70 disabled:cursor-not-allowed disabled:opacity-55"
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
												) : null}
											</button>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
});

export { StartDiscussionModal };
