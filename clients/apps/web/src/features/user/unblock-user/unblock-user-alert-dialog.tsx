import { BaseAlertDialog } from "@/core/components/ui/alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";

type UnblockUserAlertDialogProps = {
	username: string;
	onConfirm: () => void | Promise<void>;
};

const UnblockUserAlertDialog = create<UnblockUserAlertDialogProps>(
	({ username, onConfirm }) => (
		<BaseAlertDialog
			title={`Unblock @${username}?`}
			description="They will be able to view and interact with your content again. Previous follows will not be restored."
			confirmText="Unblock"
			onConfirm={onConfirm}
		/>
	),
);

export { UnblockUserAlertDialog };
