import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import type { User } from "@/features/user/common/user.ts";
import { useUnblockUser } from "./use-unblock-user.ts";

type UnblockUserAlertDialogProps = {
	user: User;
};

const UnblockUserAlertDialog = create<UnblockUserAlertDialogProps>(
	({ user }) => {
		const unblockUser = useUnblockUser();

		return (
			<BaseAlertDialog
				title={`Unblock @${user.username}?`}
				description="They will be able to view and interact with your content again. Previous follows will not be restored."
				confirmText="Unblock"
				onConfirm={() => unblockUser.mutateAsync(user.id).then(() => undefined)}
			/>
		);
	},
);

export { UnblockUserAlertDialog };
