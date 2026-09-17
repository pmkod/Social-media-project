import React from "react";
import { BaseAlertDialog } from "@/core/components/ui/alert-dialog";
import type { Comment } from "../common/comment";
import { useDeleteComment } from "./use-delete-comment";

type DeleteCommentAlertDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	comment: Comment;
	onDeleted?: () => void;
};

export function DeleteCommentAlertDialog({
	open,
	onOpenChange,
	comment,
	onDeleted,
}: DeleteCommentAlertDialogProps) {
	const deleteComment = useDeleteComment();

	return (
		<BaseAlertDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Delete comment?"
			description="This can't be undone and it will be removed from this post."
			confirmText="Delete"
			confirmColorScheme="destructive"
			onConfirm={async () => {
				await deleteComment.mutateAsync(comment);
				onDeleted?.();
			}}
		/>
	);
}
