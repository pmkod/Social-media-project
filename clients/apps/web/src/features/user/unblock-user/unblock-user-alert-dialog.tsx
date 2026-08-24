import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import { useUnblockUser } from "./use-unblock-user.ts";

type UnblockUserAlertDialogProps = {
	userId: string;
	username: string;
};

const UnblockUserAlertDialog = create<UnblockUserAlertDialogProps>(
	({ userId, username }) => {
		const unblockUser = useUnblockUser();

		return (
			<BaseAlertDialog
				title={`Unblock @${username}?`}
				description="They will be able to view and interact with your content again. Previous follows will not be restored."
				confirmText="Unblock"
				onConfirm={() => unblockUser.mutateAsync(userId).then(() => undefined)}
			/>
		);
	},
);

export { UnblockUserAlertDialog };
