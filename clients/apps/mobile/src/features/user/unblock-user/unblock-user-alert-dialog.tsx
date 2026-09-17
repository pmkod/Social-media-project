import React from "react";
import { BaseAlertDialog } from "@/core/components/ui/alert-dialog";
import type { User } from "../common/user";
import { useUnblockUser } from "./use-unblock-user";

type UnblockUserAlertDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User;
	onUnblocked?: () => void;
};

export function UnblockUserAlertDialog({
	open,
	onOpenChange,
	user,
	onUnblocked,
}: UnblockUserAlertDialogProps) {
	const unblockUser = useUnblockUser();

	return (
		<BaseAlertDialog
			open={open}
			onOpenChange={onOpenChange}
			title={`Unblock @${user.username}?`}
			description="They will now be able to view your posts and follow you."
			confirmText="Unblock"
			confirmColorScheme="primary"
			onConfirm={async () => {
				await unblockUser.mutateAsync(user.id);
				onUnblocked?.();
			}}
		/>
	);
}
