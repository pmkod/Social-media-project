import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import * as m from "@/paraglide/messages.js";
import {
	useDeleteDiscussion,
	useLeaveDiscussion,
	useRemoveDiscussionMember,
} from "../hooks/use-discussion-actions.ts";

type DiscussionActionProps = {
	discussionId: string;
	title: string;
};

const DeleteDiscussionAlertDialog = create<DiscussionActionProps>(
	({ discussionId, title }) => {
		const deleteDiscussion = useDeleteDiscussion();
		const navigate = useNavigate();
		return (
			<BaseAlertDialog
				title={m.discussion_delete_title({ title })}
				description={m.discussion_delete_description()}
				confirmText={m.discussion_delete()}
				confirmColorScheme="destructive"
				onConfirm={async () => {
					try {
						await deleteDiscussion.mutateAsync(discussionId);
						await navigate({ to: "/discussions" });
					} catch (error) {
						toast.error("La discussion n’a pas pu être supprimée");
						throw error;
					}
				}}
			/>
		);
	},
);

const LeaveDiscussionAlertDialog = create<
	DiscussionActionProps & { userId: string }
>(({ discussionId, userId, title }) => {
	const leaveDiscussion = useLeaveDiscussion();
	const navigate = useNavigate();
	return (
		<BaseAlertDialog
			title={m.discussion_leave_title({ title })}
			description={m.discussion_leave_description()}
			confirmText={m.discussion_leave()}
			confirmColorScheme="destructive"
			onConfirm={async () => {
				try {
					await leaveDiscussion.mutateAsync({ discussionId, userId });
					await navigate({ to: "/discussions" });
				} catch (error) {
					toast.error("Vous n’avez pas pu quitter la discussion");
					throw error;
				}
			}}
		/>
	);
});

const RemoveDiscussionMemberAlertDialog = create<{
	discussionId: string;
	userId: string;
	memberName: string;
	onRemoved?: (userId: string) => void;
}>(({ discussionId, userId, memberName, onRemoved }) => {
	const removeMember = useRemoveDiscussionMember();
	return (
		<BaseAlertDialog
			title={m.discussion_remove_member_title({ name: memberName })}
			description={m.discussion_remove_member_description()}
			confirmText={m.discussion_remove()}
			confirmColorScheme="destructive"
			onConfirm={async () => {
				try {
					await removeMember.mutateAsync({ discussionId, userId });
					onRemoved?.(userId);
				} catch (error) {
					toast.error("Ce membre n’a pas pu être retiré");
					throw error;
				}
			}}
		/>
	);
});

export {
	DeleteDiscussionAlertDialog,
	LeaveDiscussionAlertDialog,
	RemoveDiscussionMemberAlertDialog,
};
