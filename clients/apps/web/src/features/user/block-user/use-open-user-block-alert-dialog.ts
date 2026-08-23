import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { useBlockUser } from "./use-block-user.ts";
import { useUnblockUser } from "./use-unblock-user.ts";
import {
	BlockUserAlertDialog,
	UnblockUserAlertDialog,
} from "./user-block-alert-dialogs.tsx";

type OpenUserBlockAlertDialogParams = {
	userId: string;
	username: string;
	isBlockedByAuthenticatedUser: boolean;
};

const useOpenUserBlockAlertDialog = () => {
	const blockUser = useBlockUser();
	const unblockUser = useUnblockUser();

	const open = ({
		userId,
		username,
		isBlockedByAuthenticatedUser,
	}: OpenUserBlockAlertDialogParams) => {
		if (isBlockedByAuthenticatedUser) {
			void NiceModal.show(UnblockUserAlertDialog, {
				username,
				onConfirm: () => unblockUser.mutateAsync(userId).then(() => undefined),
			});
			return;
		}

		void NiceModal.show(BlockUserAlertDialog, {
			username,
			onConfirm: () => blockUser.mutateAsync(userId).then(() => undefined),
		});
	};

	return {
		open,
		isPending: blockUser.isPending || unblockUser.isPending,
	};
};

export { useOpenUserBlockAlertDialog };
export type { OpenUserBlockAlertDialogParams };
