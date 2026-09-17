import React from "react";
import { BaseAlertDialog } from "@/core/components/ui/alert-dialog";
import type { BookmarkCollection } from "../common/bookmark-collection";
import { useDeleteBookmarkCollection } from "./use-delete-bookmark-collection";

type DeleteBookmarkCollectionAlertDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	collection: BookmarkCollection;
	onDeleted?: () => void;
};

export function DeleteBookmarkCollectionAlertDialog({
	open,
	onOpenChange,
	collection,
	onDeleted,
}: DeleteBookmarkCollectionAlertDialogProps) {
	const deleteCollection = useDeleteBookmarkCollection();

	return (
		<BaseAlertDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Delete collection?"
			description={`Are you sure you want to delete "${collection.name}"? Posts in this collection will remain saved.`}
			confirmText="Delete"
			confirmColorScheme="destructive"
			onConfirm={async () => {
				await deleteCollection.mutateAsync(collection.id);
				onDeleted?.();
			}}
		/>
	);
}
