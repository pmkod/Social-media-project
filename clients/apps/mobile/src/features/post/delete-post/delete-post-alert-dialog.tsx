import React from "react";
import { BaseAlertDialog } from "@/core/components/ui/alert-dialog";
import type { Post } from "../common/post";
import { useDeletePost } from "./use-delete-post";

type DeletePostAlertDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	post: Post;
	onDeleted?: () => void;
};

export function DeletePostAlertDialog({
	open,
	onOpenChange,
	post,
	onDeleted,
}: DeletePostAlertDialogProps) {
	const deletePost = useDeletePost();

	return (
		<BaseAlertDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Delete post?"
			description="This can't be undone and it will be removed from your profile and the feeds."
			confirmText="Delete"
			confirmColorScheme="destructive"
			onConfirm={async () => {
				await deletePost.mutateAsync(post);
				onDeleted?.();
			}}
		/>
	);
}
