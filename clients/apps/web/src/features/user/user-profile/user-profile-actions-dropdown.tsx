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
	DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu.tsx";
import { IconButton } from "@/core/components/ui/icon-button.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { BlockUserAlertDialog } from "@/features/user/block-user/block-user-alert-dialog.tsx";
import type { User } from "@/features/user/common/user.ts";
import { UnblockUserAlertDialog } from "@/features/user/unblock-user/unblock-user-alert-dialog.tsx";

type UserProfileActionsDropdownProps = {
	user: User;
	size?: "xs" | "sm" | "md" | "lg";
	variant?: "default" | "outline" | "secondary" | "ghost";
};

const getProfileShareUrl = (username: string) => {
	const path = `/@${encodeURIComponent(username)}`;
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

function UserProfileActionsDropdown({
	user,
	size = "lg",
	variant = "ghost",
}: UserProfileActionsDropdownProps) {
	const { data } = useAuthenticatedUser();
	const authenticatedUser = data?.user;
	const isOwnProfile = Boolean(
		authenticatedUser?.id && user.id && authenticatedUser.id === user.id,
	);
	const canManageBlock = Boolean(user.id && !isOwnProfile);
	const isBlocked = user.isBlockedByAuthenticatedUser ?? false;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<IconButton
					type="button"
					variant={variant}
					size={size}
					onClick={(event) => event.stopPropagation()}
					aria-label="Profile options"
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
						void copyToClipboard(getProfileShareUrl(user.username));
					}}
				>
					<RiFileCopyLine />
					Copy profile link
				</DropdownMenuItem>
				{canManageBlock ? (
					isBlocked ? (
						<DropdownMenuItem
							onSelect={() =>
								void NiceModal.show(UnblockUserAlertDialog, {
									user,
								})
							}
						>
							<RiUserAddLine />
							Unblock user @{user.username}
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem
							variant="destructive"
							onSelect={() =>
								void NiceModal.show(BlockUserAlertDialog, {
									user,
								})
							}
						>
							<RiUserForbidLine />
							Block
						</DropdownMenuItem>
					)
				) : null}
				<DropdownMenuItem>
					<RiFlag2Line />
					Report
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { UserProfileActionsDropdown };
