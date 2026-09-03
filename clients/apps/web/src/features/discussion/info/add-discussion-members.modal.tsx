import { RiCheckLine, RiUserAddLine, RiUserSearchLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { SearchInput } from "@/core/components/ui/search-input.tsx";
import { useDebounceValue } from "@/core/hooks/use-debounce-value.ts";
import { cn } from "@/core/lib/utils.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserRowItemListLoader } from "@/features/user/common/components/user-row-item-list-loader.tsx";
import type { User } from "@/features/user/common/user.ts";
import { useSearchUsers } from "@/features/user/search/use-search-users.ts";
import type { Discussion } from "../common/discussion.ts";
import { useAddDiscussionMembers } from "../hooks/use-discussion-actions.ts";

type AddDiscussionMembersModalProps = {
	discussion: Discussion;
	onAdded?: (users: User[]) => void;
};

const AddDiscussionMembersModal = create<AddDiscussionMembersModalProps>(
	({ discussion, onAdded }) => {
		const modal = useModal();
		const addMembers = useAddDiscussionMembers();
		const [query, setQuery] = useState("");
		const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
		const [debouncedQuery] = useDebounceValue(query.trim(), 400);
		const usersQuery = useSearchUsers({
			query: debouncedQuery,
			limit: 10,
			enabled: debouncedQuery.length >= 2,
		});
		const existingMemberIds = useMemo(
			() => new Set(discussion.members.map((member) => member.userId)),
			[discussion.members],
		);
		const users =
			usersQuery.data?.pages
				.flatMap((page) => page.users)
				.filter((user) => !existingMemberIds.has(user.id)) ?? [];

		const close = () => {
			if (!addMembers.isPending) modal.remove();
		};
		const toggleUser = (user: User) => {
			setSelectedUsers((current) =>
				current.some((selected) => selected.id === user.id)
					? current.filter((selected) => selected.id !== user.id)
					: [...current, user],
			);
		};
		const submit = async () => {
			if (selectedUsers.length === 0 || addMembers.isPending) return;
			try {
				await addMembers.mutateAsync({
					discussionId: discussion.id,
					userIds: selectedUsers.map((user) => user.id),
				});
				toast.success(
					selectedUsers.length === 1
						? "Membre ajouté"
						: `${selectedUsers.length} membres ajoutés`,
				);
				onAdded?.(selectedUsers);
				modal.resolve();
				modal.remove();
			} catch {
				toast.error("Les membres n’ont pas pu être ajoutés");
			}
		};

		return (
			<Dialog
				open={modal.visible}
				onOpenChange={(open) => {
					if (!open) close();
				}}
			>
				<DialogContent size="lg" className="h-[min(42rem,calc(100dvh-2rem))]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<RiUserAddLine className="size-5 text-primary" />
							Ajouter des membres
						</DialogTitle>
						<DialogDescription>
							Recherchez les personnes à ajouter à « {discussion.name} ».
						</DialogDescription>
					</DialogHeader>
					<DialogBody className="flex min-h-0 flex-col">
						<div className="shrink-0 px-5 py-4">
							<SearchInput
								label="Rechercher des personnes"
								size="lg"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Nom ou nom d’utilisateur"
								autoFocus
								disabled={addMembers.isPending}
							/>
						</div>
						<div className="min-h-0 flex-1 overflow-y-auto border-t border-border">
							{debouncedQuery.length < 2 ? (
								<div className="flex h-full min-h-56 items-center justify-center px-5 text-center">
									<div>
										<RiUserSearchLine className="mx-auto size-7 text-muted-foreground" />
										<p className="mt-3 text-sm font-medium">
											Rechercher une personne
										</p>
										<p className="mt-1 text-xs text-muted-foreground">
											Saisissez au moins deux caractères.
										</p>
									</div>
								</div>
							) : usersQuery.isLoading ? (
								<UserRowItemListLoader count={5} />
							) : usersQuery.isError ? (
								<ExceptionBlock
									bordered={false}
									className="min-h-56"
									title="Recherche indisponible"
									description="Réessayez dans quelques instants."
									onRefresh={() => void usersQuery.refetch()}
									isRefetching={usersQuery.isRefetching}
								/>
							) : users.length === 0 ? (
								<EmptyBlock
									bordered={false}
									className="min-h-56"
									title="Aucune personne disponible"
									description="Les comptes trouvés font peut-être déjà partie du groupe."
								/>
							) : (
								<div className="divide-y divide-border/70">
									{users.map((user) => {
										const isSelected = selectedUsers.some(
											(selected) => selected.id === user.id,
										);
										const isBlocked =
											user.isBlockedByAuthenticatedUser ||
											user.hasBlockedAuthenticatedInUser;
										return (
											<button
												key={user.id}
												type="button"
												onClick={() => toggleUser(user)}
												disabled={addMembers.isPending || Boolean(isBlocked)}
												className={cn(
													"flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-accent/70 disabled:cursor-not-allowed disabled:opacity-50",
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
															? "Ajout indisponible"
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
								</div>
							)}
						</div>
					</DialogBody>
					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={close}
							disabled={addMembers.isPending}
						>
							Annuler
						</Button>
						<Button
							type="button"
							onClick={() => void submit()}
							disabled={selectedUsers.length === 0}
							isLoading={addMembers.isPending}
						>
							Ajouter{selectedUsers.length ? ` (${selectedUsers.length})` : ""}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	},
);

export { AddDiscussionMembersModal };
