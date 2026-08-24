import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { useBlockUser } from "./use-block-user.ts";
import { BlockUserAlertDialog } from "./user-block-alert-dialogs.tsx";

type OpenUserBlockAlertDialogParams = {
	userId: string;
	username: string;
};

const useOpenUserBlockAlertDialog = () => {
	const blockUser = useBlockUser();

	const open = ({ userId, username }: OpenUserBlockAlertDialogParams) => {
		void NiceModal.show(BlockUserAlertDialog, {
			username,
			onConfirm: () => blockUser.mutate(userId),
		});
	};

	return {
		open,
		isPending: blockUser.isPending,
	};
};

export { useOpenUserBlockAlertDialog };
