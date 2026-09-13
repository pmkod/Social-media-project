import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import * as m from "@/paraglide/messages.js";
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
				title={m.comment_delete_title()}
				description={m.comment_delete_description()}
				confirmText={m.comment_delete()}
				confirmColorScheme="destructive"
				onConfirm={() =>
					deleteComment.mutateAsync(comment).then(() => undefined)
				}
			/>
		);
	},
);

export { DeleteCommentAlertDialog };
