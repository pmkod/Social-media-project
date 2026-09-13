import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import type { User } from "@/features/user/common/user.ts";
import * as m from "@/paraglide/messages.js";
import { useBlockUser } from "./use-block-user.ts";

type BlockUserAlertDialogProps = {
	user: User;
};

const BlockUserAlertDialog = create<BlockUserAlertDialogProps>(({ user }) => {
	const blockUser = useBlockUser();

	return (
		<BaseAlertDialog
			title={m.profile_block_title({ username: user.username })}
			description={m.profile_block_description()}
			confirmText={m.profile_block()}
			confirmColorScheme="destructive"
			onConfirm={() => blockUser.mutateAsync(user.id).then(() => undefined)}
		/>
	);
});

export { BlockUserAlertDialog };
