import { RiEdit2Line, RiFolderAddLine } from "@remixicon/react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { useCreateBookmarkCollection } from "../create-bookmark-collection/use-create-bookmark-collection.ts";
import { useEditBookmarkCollection } from "../edit-bookmark-collection/use-edit-bookmark-collection.ts";
import type { BookmarkCollection } from "./bookmark-collection.ts";
import { BookmarkCollectionModalForm } from "./bookmark-collection-modal-form.tsx";

type BookmarkCollectionModalProps = {
	collection?: BookmarkCollection;
};

const BookmarkCollectionModal = create<BookmarkCollectionModalProps>(
	({ collection }) => {
		const modal = useModal();
		const createCollection = useCreateBookmarkCollection();
		const editCollection = useEditBookmarkCollection();
		const isEditing = Boolean(collection);
		const mutation = isEditing ? editCollection : createCollection;

		const close = () => {
			modal.resolve();
			modal.remove();
		};

		const handleSuccess = (updatedCollection: BookmarkCollection) => {
			modal.resolve(updatedCollection);
			modal.remove();
		};

		return (
			<Dialog
				open={modal.visible}
				onOpenChange={(open) => {
					if (!open) close();
				}}
			>
				<DialogContent size="lg">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							{isEditing
								? "Edit bookmark collection"
								: "Create bookmark collection"}
						</DialogTitle>
					</DialogHeader>

					<BookmarkCollectionModalForm
						collection={collection}
						isPending={mutation.isPending}
						isError={mutation.isError}
						submitLabel={isEditing ? "Save changes" : "Create collection"}
						onChange={() => mutation.reset()}
						onSubmit={(values) => {
							if (collection) {
								editCollection.mutate(
									{ collectionId: collection.id, ...values },
									{ onSuccess: handleSuccess },
								);
								return;
							}

							createCollection.mutate(values, {
								onSuccess: handleSuccess,
							});
						}}
					/>
				</DialogContent>
			</Dialog>
		);
	},
);

export { BookmarkCollectionModal };
export type { BookmarkCollectionModalProps };
