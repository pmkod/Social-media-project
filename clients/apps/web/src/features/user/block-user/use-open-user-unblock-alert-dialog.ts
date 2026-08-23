import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { useUnblockUser } from "./use-unblock-user.ts";
import { UnblockUserAlertDialog } from "./user-block-alert-dialogs.tsx";

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
