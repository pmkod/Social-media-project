import { BaseAlertDialog } from "@/core/components/ui/alert-dialog.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { useUnblockUser } from "./use-unblock-user.ts";

type OpenUserUnblockAlertDialogParams = {
	userId: string;
	username: string;
};

const useOpenUserUnblockAlertDialog = () => {
	const unblockUser = useUnblockUser();

	const open = ({ userId, username }: OpenUserUnblockAlertDialogParams) => {
		void NiceModal.show(BaseAlertDialog, {
			title: `Unblock @${username}?`,
			description:
				"They will be able to view and interact with your content again. Previous follows will not be restored.",
			confirmText: "Unblock",
			onConfirm: () => unblockUser.mutateAsync(userId).then(() => undefined),
		});
	};

	return {
		open,
		isPending: unblockUser.isPending,
	};
};

export { useOpenUserUnblockAlertDialog };
