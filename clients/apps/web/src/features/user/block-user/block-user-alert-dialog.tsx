import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import type { User } from "@/features/user/common/user.ts";
import { useBlockUser } from "./use-block-user.ts";

type BlockUserAlertDialogProps = {
	user: User;
};

const BlockUserAlertDialog = create<BlockUserAlertDialogProps>(({ user }) => {
	const blockUser = useBlockUser();

	return (
		<BaseAlertDialog
			title={`Block @${user.username}?`}
			description="You will no longer see each other's content. If either of you follows the other, those follows will be removed."
			confirmText="Block"
			confirmColorScheme="destructive"
			onConfirm={() => blockUser.mutateAsync(user.id).then(() => undefined)}
		/>
	);
});

export { BlockUserAlertDialog };
