import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { UnblockUserAlertDialog } from "./unblock-user-alert-dialog.tsx";
import { useUnblockUser } from "./use-unblock-user.ts";

type OpenUserUnblockAlertDialogParams = {
	userId: string;
	username: string;
};

const useOpenUserUnblockAlertDialog = () => {
	const unblockUser = useUnblockUser();

	const open = ({ userId, username }: OpenUserUnblockAlertDialogParams) => {
		void NiceModal.show(UnblockUserAlertDialog, {
			username,
			onConfirm: () => unblockUser.mutateAsync(userId).then(() => undefined),
		});
	};

	return {
		open,
		isPending: unblockUser.isPending,
	};
};

export { useOpenUserUnblockAlertDialog };
