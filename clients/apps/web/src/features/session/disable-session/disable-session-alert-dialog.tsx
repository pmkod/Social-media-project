import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import { getExceptionMessage } from "@/core/exceptions/translate-exception-code.ts";
import { deleteSessionCredentials } from "@/core/utils/session.utils.ts";
import * as m from "@/paraglide/messages.js";
import type { Session } from "../common/session.ts";
import { getSessionName } from "../common/session.utils.ts";
import { useDisableSession } from "./use-disable-session.ts";

type DisableSessionAlertDialogProps = {
	session: Session;
	isCurrent: boolean;
};

const DisableSessionAlertDialog = create<DisableSessionAlertDialogProps>(
	({ session, isCurrent }) => {
		const disableSession = useDisableSession();
		const queryClient = useQueryClient();
		const navigate = useNavigate();

		const deviceName = getSessionName(session);

		return (
			<BaseAlertDialog
				title={
					isCurrent
						? m.settings_logout_current_title()
						: m.settings_logout_device_title({ device: deviceName })
				}
				description={
					isCurrent
						? m.settings_logout_current_description()
						: m.settings_logout_device_description()
				}
				confirmText={m.settings_logout()}
				confirmColorScheme="destructive"
				onConfirm={async () => {
					try {
						await disableSession.mutateAsync(session.id);
						if (isCurrent) {
							deleteSessionCredentials();
							queryClient.clear();
							await navigate({ to: "/" });
							return;
						}
						toast.success(m.settings_session_logged_out());
					} catch (error) {
						toast.error(getExceptionMessage(error));
						throw error;
					}
				}}
			/>
		);
	},
);

export type { DisableSessionAlertDialogProps };
export { DisableSessionAlertDialog };
