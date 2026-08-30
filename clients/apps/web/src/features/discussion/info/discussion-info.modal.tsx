import {
	RiDeleteBinLine,
	RiFlag2Line,
	RiLogoutBoxRLine,
	RiUserAddLine,
	RiUserForbidLine,
	RiUserLine,
	RiUserUnfollowLine,
} from "@remixicon/react";
import { useNavigate } from "@tanstack/react-router";
import { type ComponentType, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { IconButton } from "@/core/components/ui/icon-button.tsx";
import NiceModal, {
	create,
	useModal,
} from "@/core/components/ui/nice-modal.tsx";
import { cn } from "@/core/lib/utils.ts";
import { ReportModal } from "@/features/report/report.modal.tsx";
import { BlockUserAlertDialog } from "@/features/user/block-user/block-user-alert-dialog.tsx";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UnblockUserAlertDialog } from "@/features/user/unblock-user/unblock-user-alert-dialog.tsx";
import { DiscussionTypes } from "../common/discussion.constants.ts";
import type { Discussion, DiscussionMember } from "../common/discussion.ts";
import {
	getDiscussionSubtitle,
	getDiscussionTitle,
	getOtherDiscussionMember,
} from "../common/discussion.utils.ts";
import { DiscussionAvatar } from "../common/discussion-avatar.tsx";
import { useSetDiscussionBlocked } from "../hooks/use-discussion-actions.ts";
import { useDiscussionMedia } from "../hooks/use-discussion-media.ts";
import {
	DiscussionMediaPreviewModal,
	DiscussionMediaTile,
} from "../media/discussion-media-preview.modal.tsx";
import { AddDiscussionMembersModal } from "./add-discussion-members.modal.tsx";
import {
	DeleteDiscussionAlertDialog,
	LeaveDiscussionAlertDialog,
	RemoveDiscussionMemberAlertDialog,
} from "./discussion-action-alert-dialogs.tsx";

type DiscussionInfoModalProps = {
	discussion: Discussion;
	authenticatedUserId: string;
};

type ActionButtonProps = {
	icon: ComponentType<{ className?: string }>;
	label: string;
	onClick: () => void;
	destructive?: boolean;
	disabled?: boolean;
};

function ActionButton({
	icon: Icon,
	label,
	onClick,
	destructive,
	disabled,
}: ActionButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"group flex min-w-0 flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45",
				destructive && "text-destructive hover:bg-destructive/10",
			)}
		>
			<span
				className={cn(
					"flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary/15",
					destructive && "bg-destructive/10 text-destructive",
				)}
			>
				<Icon className="size-5" />
			</span>
			<span className="text-xs font-medium leading-4">{label}</span>
		</button>
	);
}

const RoleLabels = {
	OWNER: "Propriétaire",
	ADMIN: "Administrateur",
	MEMBER: "Membre",
} as const;

const canRemoveMember = (
	currentUserId: string,
	currentUserRole: Discussion["currentUserRole"],
	member: DiscussionMember,
) => {
	if (member.userId === currentUserId || member.role === "OWNER") return false;
	if (currentUserRole === "OWNER") return true;
	return currentUserRole === "ADMIN" && member.role === "MEMBER";
};

const DiscussionInfoModal = create<DiscussionInfoModalProps>(
	({ discussion, authenticatedUserId }) => {
		const modal = useModal();
		const navigate = useNavigate();
		const setDiscussionBlocked = useSetDiscussionBlocked();
		const mediaQuery = useDiscussionMedia(discussion.id, 30);
		const [isBlocked, setIsBlocked] = useState(discussion.currentUserIsBlocked);
		const [removedMemberIds, setRemovedMemberIds] = useState<Set<string>>(
			() => new Set(),
		);
		const [addedMembers, setAddedMembers] = useState<DiscussionMember[]>([]);
		const isGroup = discussion.type === DiscussionTypes.GROUP;
		const otherMember = isGroup
			? null
			: getOtherDiscussionMember(discussion, authenticatedUserId);
		const title = getDiscussionTitle(discussion, authenticatedUserId);
		const subtitle = getDiscussionSubtitle(discussion, authenticatedUserId);
		const canManageMembers =
			discussion.currentUserRole === "OWNER" ||
			discussion.currentUserRole === "ADMIN";
		const visibleMembers = [...discussion.members, ...addedMembers].filter(
			(member) => !removedMemberIds.has(member.userId),
		);
		const media = useMemo(
			() => mediaQuery.data?.pages.flatMap((page) => page.media) ?? [],
			[mediaQuery.data?.pages],
		);

		const closeThenShow = (
			component: Parameters<typeof NiceModal.show>[0],
			props?: Record<string, unknown>,
		) => {
			modal.remove();
			void NiceModal.show(component, props);
		};
		const openProfile = async (member: DiscussionMember | null) => {
			if (!member?.user) return;
			modal.remove();
			await navigate({
				to: "/$username",
				params: { username: `@${member.user.username}` },
			});
		};
		const toggleDiscussionBlocked = async () => {
			if (setDiscussionBlocked.isPending) return;
			try {
				const nextValue = !isBlocked;
				await setDiscussionBlocked.mutateAsync({
					discussionId: discussion.id,
					userId: authenticatedUserId,
					isBlocked: nextValue,
				});
				setIsBlocked(nextValue);
				toast.success(
					nextValue ? "Discussion bloquée" : "Discussion débloquée",
				);
			} catch {
				toast.error("L’état de la discussion n’a pas pu être modifié");
			}
		};
		const openAddMembers = () => {
			void NiceModal.show(AddDiscussionMembersModal, {
				discussion: { ...discussion, members: visibleMembers },
				onAdded: (users) => {
					const now = new Date().toISOString();
					setAddedMembers((current) => [
						...current,
						...users
							.filter(
								(user) =>
									!discussion.members.some(
										(member) => member.userId === user.id,
									) && !current.some((member) => member.userId === user.id),
							)
							.map((user) => ({
								userId: user.id,
								role: "MEMBER" as const,
								joinedAt: now,
								lastReadAt: now,
								user,
							})),
					]);
				},
			});
		};

		return (
			<Dialog
				open={modal.visible}
				onOpenChange={(open) => {
					if (!open && !setDiscussionBlocked.isPending) modal.remove();
				}}
			>
				<DialogContent size="xl" className="h-[min(48rem,calc(100dvh-2rem))]">
					<DialogHeader>
						<DialogTitle>Informations sur la discussion</DialogTitle>
						<DialogDescription className="sr-only">
							Membres, actions et médias partagés dans cette discussion.
						</DialogDescription>
					</DialogHeader>
					<DialogBody>
						<section className="flex flex-col items-center px-5 pb-5 pt-7 text-center">
							<DiscussionAvatar
								discussion={discussion}
								authenticatedUserId={authenticatedUserId}
								size="xl"
							/>
							<h2 className="mt-4 max-w-full truncate text-xl font-bold">
								{title}
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
							{discussion.description ? (
								<p className="mt-3 max-w-md text-sm leading-5 text-muted-foreground">
									{discussion.description}
								</p>
							) : null}
						</section>

						<section
							aria-label="Actions de la discussion"
							className="grid grid-cols-4 border-y border-border px-2 py-2"
						>
							{isGroup ? (
								<>
									<ActionButton
										icon={RiUserAddLine}
										label="Ajouter"
										disabled={!canManageMembers}
										onClick={openAddMembers}
									/>
									<ActionButton
										icon={RiUserForbidLine}
										label={isBlocked ? "Débloquer" : "Bloquer"}
										disabled={setDiscussionBlocked.isPending}
										onClick={() => void toggleDiscussionBlocked()}
									/>
									<ActionButton
										icon={RiLogoutBoxRLine}
										label="Quitter"
										destructive
										onClick={() =>
											closeThenShow(LeaveDiscussionAlertDialog, {
												discussionId: discussion.id,
												userId: authenticatedUserId,
												title,
											})
										}
									/>
								</>
							) : (
								<>
									<ActionButton
										icon={RiUserLine}
										label="Profil"
										disabled={!otherMember?.user}
										onClick={() => void openProfile(otherMember)}
									/>
									<ActionButton
										icon={RiFlag2Line}
										label="Signaler"
										destructive
										onClick={() =>
											closeThenShow(ReportModal, {
												discussionId: discussion.id,
											})
										}
									/>
									<ActionButton
										icon={RiUserForbidLine}
										label={
											otherMember?.user?.isBlockedByAuthenticatedUser
												? "Débloquer"
												: "Bloquer"
										}
										destructive
										disabled={!otherMember?.user}
										onClick={() => {
											if (otherMember?.user) {
												closeThenShow(
													otherMember.user.isBlockedByAuthenticatedUser
														? UnblockUserAlertDialog
														: BlockUserAlertDialog,
													{ user: otherMember.user },
												);
											}
										}}
									/>
								</>
							)}
							<ActionButton
								icon={RiDeleteBinLine}
								label="Supprimer"
								destructive
								onClick={() =>
									closeThenShow(DeleteDiscussionAlertDialog, {
										discussionId: discussion.id,
										title,
									})
								}
							/>
						</section>

						{isGroup ? (
							<section className="border-b border-border px-5 py-5">
								<div className="mb-3 flex items-center justify-between gap-3">
									<h3 className="font-semibold">
										Membres · {visibleMembers.length}
									</h3>
									{canManageMembers ? (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={openAddMembers}
										>
											<RiUserAddLine /> Ajouter
										</Button>
									) : null}
								</div>
								<div className="divide-y divide-border/70 rounded-xl border border-border">
									{visibleMembers.map((member) => (
										<div
											key={member.userId}
											className="flex items-center gap-3 px-3 py-3"
										>
											<UserAvatar user={member.user ?? undefined} size="md" />
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-semibold">
													{member.user?.fullName ||
														(member.user
															? `@${member.user.username}`
															: "Utilisateur indisponible")}
													{member.userId === authenticatedUserId
														? " (vous)"
														: ""}
												</p>
												<p className="text-xs text-muted-foreground">
													{RoleLabels[member.role]}
												</p>
											</div>
											{member.user ? (
												<IconButton
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => void openProfile(member)}
													aria-label={`Voir le profil de ${member.user.username}`}
												>
													<RiUserLine />
												</IconButton>
											) : null}
											{canRemoveMember(
												authenticatedUserId,
												discussion.currentUserRole,
												member,
											) ? (
												<IconButton
													type="button"
													variant="ghost"
													colorScheme="destructive"
													size="sm"
													onClick={() =>
														void NiceModal.show(
															RemoveDiscussionMemberAlertDialog,
															{
																discussionId: discussion.id,
																userId: member.userId,
																memberName:
																	member.user?.fullName ||
																	`@${member.user?.username || "utilisateur"}`,
																onRemoved: (userId: string) =>
																	setRemovedMemberIds((current) =>
																		new Set(current).add(userId),
																	),
															},
														)
													}
													aria-label={`Retirer ${member.user?.username || "ce membre"}`}
												>
													<RiUserUnfollowLine />
												</IconButton>
											) : null}
										</div>
									))}
								</div>
							</section>
						) : null}

						<section className="px-5 py-5">
							<h3 className="mb-3 font-semibold">Médias partagés</h3>
							{mediaQuery.isLoading ? (
								<div
									role="status"
									className="grid grid-cols-3 gap-2"
									aria-label="Chargement des médias"
								>
									{Array.from({ length: 6 }).map((_, index) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: Static loading placeholders.
											key={index}
											className="aspect-square animate-pulse rounded-xl bg-muted"
										/>
									))}
								</div>
							) : mediaQuery.isError ? (
								<ExceptionBlock
									borderless
									className="min-h-48"
									title="Médias indisponibles"
									description="Les médias de cette discussion n’ont pas pu être chargés."
									onRefresh={() => void mediaQuery.refetch()}
									isRefetching={mediaQuery.isRefetching}
								/>
							) : media.length === 0 ? (
								<EmptyBlock
									borderless
									className="min-h-40"
									title="Aucun média partagé"
									description="Les images, vidéos, audios et fichiers apparaîtront ici."
								/>
							) : (
								<>
									<div className="grid grid-cols-3 gap-2">
										{media.map((item, index) => (
											<DiscussionMediaTile
												key={item.id}
												media={item}
												onClick={() =>
													void NiceModal.show(DiscussionMediaPreviewModal, {
														items: media,
														initialIndex: index,
													})
												}
											/>
										))}
									</div>
									{mediaQuery.hasNextPage ? (
										<Button
											type="button"
											variant="ghost"
											fullWidth
											className="mt-3"
											isLoading={mediaQuery.isFetchingNextPage}
											onClick={() => void mediaQuery.fetchNextPage()}
										>
											Afficher plus
										</Button>
									) : null}
								</>
							)}
						</section>
					</DialogBody>
				</DialogContent>
			</Dialog>
		);
	},
);

export { canRemoveMember, DiscussionInfoModal };
