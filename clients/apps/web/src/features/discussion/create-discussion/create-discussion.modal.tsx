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
						Create a group
					</DialogTitle>
					<DialogDescription>
						Give your group a name and choose at least two people.
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
								<span className="text-sm font-medium">Group name</span>
								<Input
									id={groupNameId}
									value={name}
									onChange={(event) => {
										setName(event.target.value);
										if (createDiscussion.isError) createDiscussion.reset();
									}}
									placeholder="e.g. Product design team"
									maxLength={100}
									disabled={createDiscussion.isPending}
									autoFocus
								/>
							</label>

							<label htmlFor={groupDescriptionId} className="block space-y-1.5">
								<div className="flex items-center justify-between gap-3">
									<span className="text-sm font-medium">Description</span>
									<span className="text-xs text-muted-foreground">
										{description.length}/500
									</span>
								</div>
								<Textarea
									id={groupDescriptionId}
									value={description}
									onChange={(event) => setDescription(event.target.value)}
									placeholder="What is this group about? (optional)"
									maxLength={500}
									rows={2}
									className="min-h-16 resize-none"
									disabled={createDiscussion.isPending}
								/>
							</label>

							{selectedUsers.length > 0 ? (
								<div>
									<p className="mb-2 text-xs font-medium text-muted-foreground">
										Selected · {selectedUsers.length}
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
													aria-label={`Remove ${user.fullName || user.username}`}
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
								Add people
							</p>
							<div className="shrink-0 px-5 py-4">
								<SearchInput
									label="Search people"
									size="lg"
									value={memberQuery}
									onChange={(event) => setMemberQuery(event.target.value)}
									placeholder="Search by name or username"
									disabled={createDiscussion.isPending}
								/>
							</div>

							<div className="min-h-56 flex-1 overflow-y-auto border-t border-border">
								{deferredMemberQuery.length < 2 ? (
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
										description={`No account matches “${deferredMemberQuery}”.`}
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
																? "Messaging unavailable"
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
													Show more people
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
							{createDiscussion.error instanceof Error &&
							createDiscussion.error.message
								? createDiscussion.error.message
								: "Unable to create this group."}
						</p>
					) : null}

					<DialogFooter>
						<p className="mr-auto text-xs text-muted-foreground">
							{selectedUsers.length < 2
								? `${2 - selectedUsers.length} more ${2 - selectedUsers.length === 1 ? "person" : "people"} required`
								: `${selectedUsers.length} people selected`}
						</p>
						<Button
							type="submit"
							disabled={!name.trim() || selectedUsers.length < 2}
							isLoading={createDiscussion.isPending}
						>
							Create group
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
});

export { CreateGroupDiscussionModal };
