import { toast } from "sonner";
import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import { getExceptionMessage } from "@/core/exceptions/translate-exception-code.ts";
import * as m from "@/paraglide/messages.js";
import { useLogoutOtherSessions } from "./use-logout-other-sessions.ts";

const LogoutOtherSessionsAlertDialog = create(() => {
	const logoutOtherSessions = useLogoutOtherSessions();

	return (
		<BaseAlertDialog
			title={m.settings_logout_others_title()}
			description={m.settings_logout_others_description()}
			confirmText={m.settings_logout_other_sessions()}
			confirmColorScheme="destructive"
			onConfirm={async () => {
				try {
					const { disabledCount } = await logoutOtherSessions.mutateAsync();
					toast.success(
						disabledCount === 1
							? m.settings_one_session_logged_out()
							: m.settings_sessions_logged_out({ count: disabledCount }),
					);
				} catch (error) {
					toast.error(getExceptionMessage(error));
					throw error;
				}
			}}
		/>
	);
});

export { LogoutOtherSessionsAlertDialog };
