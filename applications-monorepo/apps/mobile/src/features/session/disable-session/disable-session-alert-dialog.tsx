import React from "react";
import { BaseAlertDialog } from "@/core/components/ui/alert-dialog";
import type { Session } from "../common/session";
import { useDisableSession } from "./use-disable-session";

type DisableSessionAlertDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	session: Session;
	onDisabled?: () => void;
};

export function DisableSessionAlertDialog({
	open,
	onOpenChange,
	session,
	onDisabled,
}: DisableSessionAlertDialogProps) {
	const disableSession = useDisableSession();

	return (
		<BaseAlertDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Log out from device?"
			description="This device will be disconnected and will need to log in again."
			confirmText="Log out"
			confirmColorScheme="destructive"
			onConfirm={async () => {
				await disableSession.mutateAsync(session.id);
				onDisabled?.();
			}}
		/>
	);
}
