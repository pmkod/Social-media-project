import { useAlertDialog } from "@/core/hooks/use-alert-dialog.tsx";
import { useBlockUser } from "./use-block-user.ts";
import { useUnblockUser } from "./use-unblock-user.ts";

type OpenUserBlockAlertDialogParams = {
	userId: string;
	username: string;
	isBlockedByAuthenticatedUser: boolean;
};

const useOpenUserBlockAlertDialog = () => {
	const alertDialog = useAlertDialog();
	const blockUser = useBlockUser();
	const unblockUser = useUnblockUser();

	const open = ({
		userId,
		username,
		isBlockedByAuthenticatedUser,
	}: OpenUserBlockAlertDialogParams) => {
		if (isBlockedByAuthenticatedUser) {
			alertDialog.show({
				title: `Unblock @${username}?`,
				description:
					"They will be able to view and interact with your content again. Previous follows will not be restored.",
				cancel: { text: "Cancel" },
				confirm: {
					text: "Unblock",
					handler: () => unblockUser.mutateAsync(userId).then(() => undefined),
				},
			});
			return;
		}

		alertDialog.show({
			title: `Block @${username}?`,
			description:
				"You will no longer see each other's content. If either of you follows the other, those follows will be removed.",
			cancel: { text: "Cancel" },
			confirm: {
				text: "Block",
				colorScheme: "destructive",
				handler: () => blockUser.mutateAsync(userId).then(() => undefined),
			},
		});
	};

	return {
		open,
		isPending: blockUser.isPending || unblockUser.isPending,
	};
};

export { useOpenUserBlockAlertDialog };
export type { OpenUserBlockAlertDialogParams };
