import { toast } from "sonner";
import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import { useLogoutOtherSessions } from "./use-logout-other-sessions.ts";

const LogoutOtherSessionsAlertDialog = create(() => {
	const logoutOtherSessions = useLogoutOtherSessions();

	return (
		<BaseAlertDialog
			title="Log out all other sessions?"
			description="All other active devices will be signed out of your account. Your current session will remain active."
			confirmText="Log out all other sessions"
			confirmColorScheme="destructive"
			onConfirm={async () => {
				try {
					const { disabledCount } = await logoutOtherSessions.mutateAsync();
					toast.success(
						disabledCount === 1
							? "1 other session was logged out"
							: `${disabledCount} other sessions were logged out`,
					);
				} catch (error) {
					toast.error(
						error instanceof Error
							? error.message
							: "Unable to log out of other sessions",
					);
					throw error;
				}
			}}
		/>
	);
});

export { LogoutOtherSessionsAlertDialog };
