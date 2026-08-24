import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import type { BookmarkCollection } from "../common/bookmark-collection.ts";
import { useDeleteBookmarkCollection } from "./use-delete-bookmark-collection.ts";

type DeleteBookmarkCollectionAlertDialogProps = {
	collection: BookmarkCollection;
};

const DeleteBookmarkCollectionAlertDialog =
	create<DeleteBookmarkCollectionAlertDialogProps>(({ collection }) => {
		const deleteCollection = useDeleteBookmarkCollection();

		return (
			<BaseAlertDialog
				title={`Delete "${collection.name}"?`}
				description="This collection will be deleted. Posts in other collections will remain saved."
				confirmText="Delete collection"
				confirmColorScheme="destructive"
				onConfirm={() =>
					deleteCollection.mutateAsync(collection.id).then(() => undefined)
				}
			/>
		);
	});

export { DeleteBookmarkCollectionAlertDialog };
