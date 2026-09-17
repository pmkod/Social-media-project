import React from "react";
import { BaseAlertDialog } from "@/core/components/ui/alert-dialog";
import { useLogoutOtherSessions } from "./use-logout-other-sessions";

type LogoutOtherSessionsAlertDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
};

export function LogoutOtherSessionsAlertDialog({
	open,
	onOpenChange,
	onSuccess,
}: LogoutOtherSessionsAlertDialogProps) {
	const logoutOtherSessions = useLogoutOtherSessions();

	return (
		<BaseAlertDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Log out from all other devices?"
			description="You will be logged out on all other devices except this one."
			confirmText="Log out all others"
			confirmColorScheme="destructive"
			onConfirm={async () => {
				await logoutOtherSessions.mutateAsync();
				onSuccess?.();
			}}
		/>
	);
}
