import {
	RiFileCopyLine,
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
import { ReportModal } from "@/features/report/report.modal.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { BlockUserAlertDialog } from "@/features/user/block-user/block-user-alert-dialog.tsx";
import type { User } from "@/features/user/common/user.ts";
import { UnblockUserAlertDialog } from "@/features/user/unblock-user/unblock-user-alert-dialog.tsx";
import type { Post } from "./post";

type PostActionsDropdownProps = {
	post: Post;
	user: User;
	size?: "xs" | "sm" | "md" | "lg";
	variant?: "default" | "outline" | "secondary" | "ghost";
};

const getPostShareUrl = (post: Post) => {
	const path =
		post.type === "POST"
			? `/posts/${encodeURIComponent(post.id)}`
			: `/chillzs/${encodeURIComponent(post.id)}`;
	return typeof window === "undefined"
		? path
		: new URL(path, window.location.origin).toString();
};

const copyToClipboard = async (value: string) => {
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(value);
		return;
	}
	const textarea = document.createElement("textarea");
	textarea.value = value;
	textarea.style.position = "fixed";
	textarea.style.opacity = "0";
	document.body.appendChild(textarea);
	textarea.select();
	document.execCommand("copy");
	textarea.remove();
};

function PostActionsDropdown({
	post,
	user,
	size = "md",
	variant = "ghost",
}: PostActionsDropdownProps) {
	const { data } = useAuthenticatedUser();
	const authenticatedUser = data?.user;

	const isOwnProfile = Boolean(
		authenticatedUser?.id && user.id && authenticatedUser.id === user.id,
	);
	const canManageBlock = Boolean(user.id && !isOwnProfile);
	const canReport = Boolean(
		authenticatedUser?.id && (!user.id || authenticatedUser.id !== user.id),
	);
	const isBlocked = user.isBlockedByAuthenticatedUser ?? false;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<IconButton
					type="button"
					variant={variant}
					size={size}
					onClick={(event) => event.stopPropagation()}
					aria-label="Post options"
				>
					<RiMoreLine />
				</IconButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				onClick={(event) => event.stopPropagation()}
			>
				<DropdownMenuItem
					onSelect={() => {
						void copyToClipboard(getPostShareUrl(post.id));
					}}
				>
					<RiFileCopyLine />
					Copy post link
				</DropdownMenuItem>
				{canReport ? (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onSelect={() => {
								void NiceModal.show(ReportModal, { post });
							}}
						>
							<RiFlag2Line />
							Report post
						</DropdownMenuItem>
					</>
				) : null}
				{canManageBlock ? (
					isBlocked ? (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onSelect={() =>
									NiceModal.show(UnblockUserAlertDialog, {
										user,
									})
								}
							>
								<RiUserAddLine />
								Unblock user @{user.username}
							</DropdownMenuItem>
						</>
					) : (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								variant="destructive"
								onSelect={() =>
									NiceModal.show(BlockUserAlertDialog, {
										user,
									})
								}
							>
								<RiUserForbidLine />
								Block user @{user.username}
							</DropdownMenuItem>
						</>
					)
				) : null}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { PostActionsDropdown };
