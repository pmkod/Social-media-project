import { RiCloseLine, RiGroupLine } from "@remixicon/react";
import { useNavigate } from "@tanstack/react-router";
import { useId, useState } from "react";
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
import { Input } from "@/core/components/ui/input.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { Textarea } from "@/core/components/ui/textarea.tsx";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import type { User } from "@/features/user/common/user.ts";
import { DiscussionUserPicker } from "../common/discussion-user-picker.tsx";
import { useCreateDiscussion } from "../hooks/use-create-discussion.ts";

const CreateDiscussionModal = create(() => {
	const modal = useModal();
	const navigate = useNavigate();
	const createDiscussion = useCreateDiscussion();
	const groupNameId = useId();
	const groupDescriptionId = useId();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

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
				type: "GROUP",
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
												className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-muted/60 py-1 pl-1 pr-2"
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
							<DiscussionUserPicker
								selectedUserIds={selectedUsers.map((user) => user.id)}
								onSelect={toggleUser}
								disabled={createDiscussion.isPending}
								autoFocus={false}
							/>
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

export { CreateDiscussionModal };
