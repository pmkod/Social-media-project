import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
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
				title={`Supprimer « ${title} » ?`}
				description="La discussion sera retirée de votre liste. Elle pourra réapparaître si un nouveau message est envoyé."
				confirmText="Supprimer"
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
			title={`Quitter « ${title} » ?`}
			description="Vous ne recevrez plus les nouveaux messages et la discussion sera retirée de votre liste."
			confirmText="Quitter"
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
			title={`Retirer ${memberName} ?`}
			description="Cette personne ne pourra plus consulter les nouveaux messages du groupe."
			confirmText="Retirer"
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
