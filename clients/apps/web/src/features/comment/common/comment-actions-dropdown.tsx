import {
	RiDeleteBinLine,
	RiFlag2Line,
	RiMoreLine,
	RiUserAddLine,
	RiUserForbidLine,
} from "@remixicon/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu.tsx";
import { IconButton } from "@/core/components/ui/icon-button.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { DeleteCommentAlertDialog } from "@/features/comment/delete-comment/delete-comment-alert-dialog.tsx";
import { ReportModal } from "@/features/report/report.modal.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { BlockUserAlertDialog } from "@/features/user/block-user/block-user-alert-dialog.tsx";
import type { User } from "@/features/user/common/user.ts";
import { UnblockUserAlertDialog } from "@/features/user/unblock-user/unblock-user-alert-dialog.tsx";
import type { Comment } from "./comment";

type CommentActionsDropdownProps = {
	comment: Comment;
	user: User;
	size?: "xs" | "sm" | "md" | "lg";
	variant?: "default" | "outline" | "secondary" | "ghost";
};

function CommentActionsDropdown({
	comment,
	user,
	size = "xs",
	variant = "ghost",
}: CommentActionsDropdownProps) {
	const { data } = useAuthenticatedUser();
	const authenticatedUser = data?.user;
	const isOwnComment = Boolean(
		authenticatedUser?.id && user.id === authenticatedUser.id,
	);
	const canReport = Boolean(authenticatedUser?.id && !isOwnComment);
	const canDelete = isOwnComment && !comment.isDeleted;
	const canManageBlock = Boolean(user.id && !isOwnComment);
	const isBlocked = user.isBlockedByAuthenticatedUser ?? false;

	if (!canReport && !canManageBlock && !canDelete) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<IconButton
					type="button"
					variant={variant}
					size={size}
					onClick={(event) => event.stopPropagation()}
					aria-label="Comment options"
				>
					<RiMoreLine />
				</IconButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				onClick={(event) => event.stopPropagation()}
			>
				{canDelete ? (
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => {
							void NiceModal.show(DeleteCommentAlertDialog, { comment });
						}}
					>
						<RiDeleteBinLine />
						Delete comment
					</DropdownMenuItem>
				) : null}
				{canDelete && (canReport || canManageBlock) ? (
					<DropdownMenuSeparator />
				) : null}
				{canReport ? (
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => {
							void NiceModal.show(ReportModal, { comment });
						}}
					>
						<RiFlag2Line />
						Report comment
					</DropdownMenuItem>
				) : null}
				{canReport && canManageBlock ? <DropdownMenuSeparator /> : null}
				{canManageBlock ? (
					isBlocked ? (
						<DropdownMenuItem
							onSelect={() => {
								void NiceModal.show(UnblockUserAlertDialog, { user });
							}}
						>
							<RiUserAddLine />
							Unblock user @{user.username}
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem
							variant="destructive"
							onSelect={() => {
								void NiceModal.show(BlockUserAlertDialog, { user });
							}}
						>
							<RiUserForbidLine />
							Block user @{user.username}
						</DropdownMenuItem>
					)
				) : null}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { CommentActionsDropdown };
