import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import type { User } from "@/features/user/common/user.ts";
import * as m from "@/paraglide/messages.js";
import { useUnblockUser } from "./use-unblock-user.ts";

type UnblockUserAlertDialogProps = {
	user: User;
};

const UnblockUserAlertDialog = create<UnblockUserAlertDialogProps>(
	({ user }) => {
		const unblockUser = useUnblockUser();

		return (
			<BaseAlertDialog
				title={m.profile_unblock_title({ username: user.username })}
				description={m.profile_unblock_description()}
				confirmText={m.discussion_unblock()}
				onConfirm={() => unblockUser.mutateAsync(user.id).then(() => undefined)}
			/>
		);
	},
);

export { UnblockUserAlertDialog };
