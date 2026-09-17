import React from "react";
import { BaseAlertDialog } from "@/core/components/ui/alert-dialog";
import type { User } from "../common/user";
import { useBlockUser } from "./use-block-user";

type BlockUserAlertDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User;
	onBlocked?: () => void;
};

export function BlockUserAlertDialog({
	open,
	onOpenChange,
	user,
	onBlocked,
}: BlockUserAlertDialogProps) {
	const blockUser = useBlockUser();

	return (
		<BaseAlertDialog
			open={open}
			onOpenChange={onOpenChange}
			title={`Block @${user.username}?`}
			description="They will not be able to follow you or view your posts, and you will not see posts or notifications from them."
			confirmText="Block"
			confirmColorScheme="destructive"
			onConfirm={async () => {
				await blockUser.mutateAsync(user.id);
				onBlocked?.();
			}}
		/>
	);
}
