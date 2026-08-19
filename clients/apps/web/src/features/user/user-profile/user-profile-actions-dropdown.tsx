import {
	RiFileCopyLine,
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
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { useOpenUserBlockAlertDialog } from "@/features/user/block-user/use-open-user-block-alert-dialog.ts";

type UserProfileActionsDropdownProps = {
	user: {
		id?: string;
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
	size = "md",
	variant = "ghost",
}: UserProfileActionsDropdownProps) {
	const userBlockDialog = useOpenUserBlockAlertDialog();
	const { data: authenticatedUser } = useAuthenticatedUser();
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
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant={isBlocked ? "default" : "destructive"}
							disabled={userBlockDialog.isPending}
							onSelect={() =>
								userBlockDialog.open({
									userId: user.id as string,
									username: user.username,
									isBlockedByAuthenticatedUser: isBlocked,
								})
							}
						>
							{isBlocked ? <RiUserAddLine /> : <RiUserForbidLine />}
							{isBlocked ? "Unblock" : "Block"} user @{user.username}
						</DropdownMenuItem>
					</>
				) : null}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { UserProfileActionsDropdown };
