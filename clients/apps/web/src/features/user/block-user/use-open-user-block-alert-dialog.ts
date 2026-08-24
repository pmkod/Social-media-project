import { BaseAlertDialog } from "@/core/components/ui/alert-dialog.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { useBlockUser } from "./use-block-user.ts";

type OpenUserBlockAlertDialogParams = {
	userId: string;
	username: string;
};

const useOpenUserBlockAlertDialog = () => {
	const blockUser = useBlockUser();

	const open = ({ userId, username }: OpenUserBlockAlertDialogParams) => {
		void NiceModal.show(BaseAlertDialog, {
			title: `Block @${username}?`,
			description:
				"You will no longer see each other's content. If either of you follows the other, those follows will be removed.",
			confirmText: "Block",
			confirmColorScheme: "destructive",
			onConfirm: () => blockUser.mutate(userId),
		});
	};

	return {
		open,
		isPending: blockUser.isPending,
	};
};

export { useOpenUserBlockAlertDialog };
