import { BaseAlertDialog } from "@/core/components/ui/base-alert-dialog.tsx";
import { create } from "@/core/components/ui/nice-modal.tsx";
import * as m from "@/paraglide/messages.js";
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
				title={m.bookmark_collection_delete_title({ name: collection.name })}
				description={m.bookmark_collection_delete_description()}
				confirmText={m.bookmark_collection_delete_confirm()}
				confirmColorScheme="destructive"
				onConfirm={() =>
					deleteCollection.mutateAsync(collection.id).then(() => undefined)
				}
			/>
		);
	});

export { DeleteBookmarkCollectionAlertDialog };
