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
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { useOpenUserBlockAlertDialog } from "@/features/user/block-user/use-open-user-block-alert-dialog.ts";
import { useOpenUserUnblockAlertDialog } from "@/features/user/unblock-user/use-open-user-unblock-alert-dialog.ts";

type UserProfileActionsDropdownProps = {
	user: {
		id: string;
		username: string;
		isBlockedByAuthenticatedUser?: boolean;
	};
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
	const userBlockDialog = useOpenUserBlockAlertDialog();
	const userUnblockDialog = useOpenUserUnblockAlertDialog();
	const { data } = useAuthenticatedUser();
	const authenticatedUser = data?.user;
	const isOwnProfile = Boolean(
		authenticatedUser?.id && user.id && authenticatedUser.id === user.id,
	);
	const canManageBlock = Boolean(user.id && !isOwnProfile);
	const isBlocked = user.isBlockedByAuthenticatedUser ?? false;
	const userBlockAction = isBlocked ? userUnblockDialog : userBlockDialog;

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
					user.isBlockedByAuthenticatedUser ? (
						<DropdownMenuItem
							variant={isBlocked ? "default" : "destructive"}
							disabled={userBlockAction.isPending}
							onSelect={() =>
								userBlockAction.open({
									userId: user.id,
									username: user.username,
								})
							}
						>
							<RiUserAddLine />
							Unblock user @{user.username}
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem
							variant={isBlocked ? "default" : "destructive"}
							disabled={userBlockAction.isPending}
							onSelect={() =>
								userBlockAction.open({
									userId: user.id,
									username: user.username,
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
