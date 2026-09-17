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
import * as m from "@/paraglide/messages.js";
import { DiscussionTypes } from "../common/discussion.constants.ts";
import { useCreateDiscussion } from "../hooks/use-create-discussion.ts";

const CreatePrivateDiscussionModal = create(() => {
	const modal = useModal();
	const navigate = useNavigate();
	const createDiscussion = useCreateDiscussion();
	const [query, setQuery] = useState("");
	const pendingUserId = createDiscussion.isPending
		? createDiscussion.variables.memberIds[0]
		: null;
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
					<DialogTitle>{m.discussion_new_message()}</DialogTitle>
				</DialogHeader>

				<DialogBody>
					<div className="flex min-h-0 flex-col h-[min(42rem,calc(100dvh-20rem))]">
						<div className="shrink-0 px-5 py-4">
							<SearchInput
								label={m.discussion_search_people()}
								size="lg"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder={m.discussion_search_people_placeholder()}
								autoFocus
								disabled={createDiscussion.isPending}
							/>
						</div>

						<div className="min-h-56 flex-1 overflow-y-auto border-t border-border">
							{createDiscussion.isError ? (
								<div className="px-5 my-3">
									<Alert colorScheme={"destructive"}>
										<AlertDescription>
											{(createDiscussion.error as Error)?.message}
										</AlertDescription>
									</Alert>
								</div>
							) : null}
							{!isSearchEnabled ? (
								<div className="flex min-h-56 items-center justify-center px-5">
									<div className="text-center">
										<RiUserSearchLine className="mx-auto size-7 text-muted-foreground" />
										<p className="mt-3 text-sm font-medium">
											{m.discussion_find_person()}
										</p>
										<p className="mt-1 text-xs text-muted-foreground">
											{m.discussion_search_minimum()}
										</p>
									</div>
								</div>
							) : usersQuery.isLoading ? (
								<UserRowItemListLoader count={5} />
							) : usersQuery.isError ? (
								<ExceptionBlock
									bordered={false}
									className="min-h-56"
									title="Unable to search people"
									description={(usersQuery.error as Error)?.message}
									onRefresh={() => void usersQuery.refetch()}
									isRefetching={usersQuery.isRefetching}
								/>
							) : users.length === 0 ? (
								<EmptyBlock
									bordered={false}
									className="min-h-56"
									title={m.discussion_no_people_title()}
									description={m.discussion_no_account_match({
										query: debouncedQuery,
									})}
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
															? m.discussion_messaging_unavailable()
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

export { CreatePrivateDiscussionModal };
