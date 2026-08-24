import { BaseAlertDialog } from "@/core/components/ui/alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";

type BlockUserAlertDialogProps = {
	username: string;
	onConfirm: () => void | Promise<void>;
};

const BlockUserAlertDialog = create<BlockUserAlertDialogProps>(
	({ username, onConfirm }) => (
		<BaseAlertDialog
			title={`Block @${username}?`}
			description="You will no longer see each other's content. If either of you follows the other, those follows will be removed."
			confirmText="Block"
			confirmColorScheme="destructive"
			onConfirm={onConfirm}
		/>
	),
);

export { BlockUserAlertDialog };
