import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import type { Comment } from "../common/comment.ts";
import { useDeleteComment } from "./use-delete-comment.ts";

type DeleteCommentAlertDialogProps = {
	comment: Comment;
};

const DeleteCommentAlertDialog = create<DeleteCommentAlertDialogProps>(
	({ comment }) => {
		const deleteComment = useDeleteComment();

		return (
			<BaseAlertDialog
				title="Delete comment?"
				description='The comment text will be replaced with "Comment deleted". Existing replies will remain visible.'
				confirmText="Delete comment"
				confirmColorScheme="destructive"
				onConfirm={() =>
					deleteComment.mutateAsync(comment.id).then(() => undefined)
				}
			/>
		);
	},
);

export { DeleteCommentAlertDialog };
