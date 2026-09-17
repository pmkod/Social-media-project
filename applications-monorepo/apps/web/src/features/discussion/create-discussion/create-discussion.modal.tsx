import {
	RiCheckLine,
	RiCloseLine,
	RiGroupLine,
	RiUserSearchLine,
} from "@remixicon/react";
import { useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useId, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { Input } from "@/core/components/ui/input.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { SearchInput } from "@/core/components/ui/search-input.tsx";
import { Textarea } from "@/core/components/ui/textarea.tsx";
import { cn } from "@/core/lib/utils.ts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserRowItemListLoader } from "@/features/user/common/components/user-row-item-list-loader.tsx";
import type { User } from "@/features/user/common/user.ts";
import { useSearchUsers } from "@/features/user/search/use-search-users.ts";
import * as m from "@/paraglide/messages.js";
import { DiscussionTypes } from "../common/discussion.constants.ts";
import { useCreateDiscussion } from "../hooks/use-create-discussion.ts";

const CreateGroupDiscussionModal = create(() => {
	const modal = useModal();
	const navigate = useNavigate();
	const createDiscussion = useCreateDiscussion();
	const groupNameId = useId();
	const groupDescriptionId = useId();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [memberQuery, setMemberQuery] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
	const deferredMemberQuery = useDeferredValue(memberQuery.trim());
	const authenticatedUser = useAuthenticatedUser();
	const usersQuery = useSearchUsers({
		query: deferredMemberQuery,
		limit: 10,
		enabled: deferredMemberQuery.length >= 2,
	});
	const users =
		usersQuery.data?.pages
			.flatMap((page) => page.users)
			.filter((user) => user.id !== authenticatedUser.data?.user.id) ?? [];

	const close = () => {
		if (createDiscussion.isPending) return;
		modal.resolve();
		modal.remove();
	};

	const toggleUser = (user: User) => {
		if (createDiscussion.isPending) return;
		createDiscussion.reset();
		setSelectedUsers((currentUsers) =>
			currentUsers.some((selectedUser) => selectedUser.id === user.id)
				? currentUsers.filter((selectedUser) => selectedUser.id !== user.id)
				: [...currentUsers, user],
		);
	};

	const submit = async () => {
		const normalizedName = name.trim();
		if (
			!normalizedName ||
			selectedUsers.length < 2 ||
			createDiscussion.isPending
		) {
			return;
		}

		try {
			const { discussion } = await createDiscussion.mutateAsync({
				type: DiscussionTypes.GROUP,
				name: normalizedName,
				description: description.trim() || undefined,
				memberIds: selectedUsers.map((user) => user.id),
			});
			modal.resolve(discussion);
			modal.remove();
			await navigate({
				to: "/discussions/$discussionId",
				params: { discussionId: discussion.id },
			});
		} catch {
			// The mutation error is displayed in the form.
		}
	};

	return (
		<Dialog
			open={modal.visible}
			onOpenChange={(open) => {
				if (!open) close();
			}}
		>
			<DialogContent size="xl" className="h-[min(46rem,calc(100dvh-2rem))]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<RiGroupLine className="size-5 text-primary" />
						{m.discussion_create_group()}
					</DialogTitle>
					<DialogDescription>
						{m.discussion_create_group_description()}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						void submit();
					}}
					className="flex min-h-0 flex-1 flex-col"
				>
					<DialogBody className="min-h-0 overflow-y-auto">
						<div className="shrink-0 space-y-4 px-5 py-4">
							<label htmlFor={groupNameId} className="block space-y-1.5">
								<span className="text-sm font-medium">
									{m.discussion_group_name()}
								</span>
								<Input
									id={groupNameId}
									value={name}
									onChange={(event) => {
										setName(event.target.value);
										if (createDiscussion.isError) createDiscussion.reset();
									}}
									placeholder={m.discussion_group_name_placeholder()}
									maxLength={100}
									disabled={createDiscussion.isPending}
									autoFocus
								/>
							</label>

							<label htmlFor={groupDescriptionId} className="block space-y-1.5">
								<div className="flex items-center justify-between gap-3">
									<span className="text-sm font-medium">
										{m.discussion_group_description()}
									</span>
									<span className="text-xs text-muted-foreground">
										{description.length}/500
									</span>
								</div>
								<Textarea
									id={groupDescriptionId}
									value={description}
									onChange={(event) => setDescription(event.target.value)}
									placeholder={m.discussion_group_description_placeholder()}
									maxLength={500}
									rows={2}
									className="min-h-16 resize-none"
									disabled={createDiscussion.isPending}
								/>
							</label>

							{selectedUsers.length > 0 ? (
								<div>
									<p className="mb-2 text-xs font-medium text-muted-foreground">
										{m.discussion_selected_count({
											count: selectedUsers.length,
										})}
									</p>
									<div className="flex gap-2 overflow-x-auto pb-1">
										{selectedUsers.map((user) => (
											<div
												key={user.id}
												className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-accent py-1 pl-1 pr-2"
											>
												<UserAvatar user={user} size="xs" />
												<span className="max-w-28 truncate text-xs font-medium">
													{user.fullName || `@${user.username}`}
												</span>
												<button
													type="button"
													onClick={() => toggleUser(user)}
													aria-label={m.discussion_remove_person({
														name: user.fullName || user.username,
													})}
													className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
												>
													<RiCloseLine className="size-3.5" />
												</button>
											</div>
										))}
									</div>
								</div>
							) : null}
						</div>

						<div className="flex min-h-0 flex-1 flex-col border-t border-border">
							<p className="shrink-0 px-5 pt-4 text-sm font-semibold">
								{m.discussion_add_people()}
							</p>
							<div className="shrink-0 px-5 py-4">
								<SearchInput
									label={m.discussion_search_people()}
									size="lg"
									value={memberQuery}
									onChange={(event) => setMemberQuery(event.target.value)}
									placeholder={m.discussion_search_people_placeholder()}
									disabled={createDiscussion.isPending}
								/>
							</div>

							<div className="min-h-56 flex-1 overflow-y-auto border-t border-border">
								{deferredMemberQuery.length < 2 ? (
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
											query: deferredMemberQuery,
										})}
									/>
								) : (
									<div className="divide-y divide-border/70">
										{users.map((user) => {
											const isSelected = selectedUsers.some(
												(selectedUser) => selectedUser.id === user.id,
											);
											const isBlocked =
												user.isBlockedByAuthenticatedUser ||
												user.hasBlockedAuthenticatedInUser;

											return (
												<button
													key={user.id}
													type="button"
													onClick={() => toggleUser(user)}
													disabled={
														createDiscussion.isPending || Boolean(isBlocked)
													}
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
																? m.discussion_messaging_unavailable()
																: `@${user.username}`}
														</p>
													</div>
													{isSelected ? (
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
													{m.discussion_show_more_people()}
												</Button>
											</div>
										) : null}
									</div>
								)}
							</div>
						</div>
					</DialogBody>

					{createDiscussion.isError ? (
						<p
							className="shrink-0 border-t border-border px-5 py-3 text-sm text-destructive"
							role="alert"
						>
							{(createDiscussion.error as Error)?.message}
						</p>
					) : null}

					<DialogFooter>
						<p className="mr-auto text-xs text-muted-foreground">
							{selectedUsers.length < 2
								? 2 - selectedUsers.length === 1
									? m.discussion_people_required_one({
											count: 2 - selectedUsers.length,
										})
									: m.discussion_people_required_many({
											count: 2 - selectedUsers.length,
										})
								: m.discussion_people_selected({ count: selectedUsers.length })}
						</p>
						<Button
							type="submit"
							disabled={!name.trim() || selectedUsers.length < 2}
							isLoading={createDiscussion.isPending}
						>
							{m.discussion_create_group()}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
});

export { CreateGroupDiscussionModal };
