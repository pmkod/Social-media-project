import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import { deleteSessionCredentials } from "@/core/utils/session.utils.ts";
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
						? "Log out of this session?"
						: `Log out of ${deviceName !== "Unknown device" ? deviceName : "this session"}?`
				}
				description={
					isCurrent
						? "You will be logged out of your account on this device and returned to the sign-in page."
						: "This device will be signed out and will need to log in again to access your account."
				}
				confirmText="Log out"
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
						toast.success("Session logged out");
					} catch (error) {
						toast.error(
							error instanceof Error
								? error.message
								: "Unable to log out of session",
						);
						throw error;
					}
				}}
			/>
		);
	},
);

export type { DisableSessionAlertDialogProps };
export { DisableSessionAlertDialog };
