import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import { useBlockUser } from "./use-block-user.ts";

type BlockUserAlertDialogProps = {
	userId: string;
	username: string;
};

const BlockUserAlertDialog = create<BlockUserAlertDialogProps>(
	({ userId, username }) => {
		const blockUser = useBlockUser();

		return (
			<BaseAlertDialog
				title={`Block @${username}?`}
				description="You will no longer see each other's content. If either of you follows the other, those follows will be removed."
				confirmText="Block"
				confirmColorScheme="destructive"
				onConfirm={() => blockUser.mutateAsync(userId).then(() => undefined)}
			/>
		);
	},
);

export { BlockUserAlertDialog };
