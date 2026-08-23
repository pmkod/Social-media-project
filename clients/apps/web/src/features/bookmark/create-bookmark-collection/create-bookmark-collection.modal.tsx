import { RiFolderAddLine } from "@remixicon/react";
import { type FormEvent, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/core/components/ui/field.tsx";
import { Input } from "@/core/components/ui/input.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { Textarea } from "@/core/components/ui/textarea.tsx";
import type { BookmarkCollection } from "../common/bookmark-collection.ts";
import { useCreateBookmarkCollection } from "./use-create-bookmark-collection.ts";

const CreateBookmarkCollectionModal = create(() => {
	const modal = useModal();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const createCollection = useCreateBookmarkCollection();

	const close = () => {
		modal.resolve();
		modal.remove();
	};

	const handleSuccess = (collection: BookmarkCollection) => {
		modal.resolve(collection);
		modal.remove();
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedName = name.trim();
		if (!trimmedName || createCollection.isPending) return;

		createCollection.mutate(
			{
				name: trimmedName,
				description: description.trim() || undefined,
			},
			{
				onSuccess: handleSuccess,
			},
		);
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
					<DialogTitle>Create bookmark collection</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="flex min-h-0 flex-1 flex-col"
					onChange={() => {
						if (createCollection.isError) createCollection.reset();
					}}
				>
					<DialogBody className="px-5 py-5">
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="bookmark-collection-name">Name</FieldLabel>
								<Input
									id="bookmark-collection-name"
									value={name}
									onChange={(event) => setName(event.target.value)}
									placeholder="e.g. Read later"
									maxLength={60}
									autoFocus
									disabled={createCollection.isPending}
									required
								/>
							</Field>

							<Field>
								<FieldLabel htmlFor="bookmark-collection-description">
									Description
								</FieldLabel>
								<Textarea
									id="bookmark-collection-description"
									value={description}
									onChange={(event) => setDescription(event.target.value)}
									placeholder="What will you save here?"
									maxLength={280}
									rows={3}
									disabled={createCollection.isPending}
								/>
								<FieldDescription className="text-right">
									{description.length}/280
								</FieldDescription>
							</Field>
						</FieldGroup>

						{createCollection.isError ? (
							<p className="mt-4 text-sm text-destructive" role="alert">
								Unable to create this collection. Please try again.
							</p>
						) : null}
					</DialogBody>

					<DialogFooter>
						<Button
							type="submit"
							disabled={!name.trim() || createCollection.isPending}
							isLoading={createCollection.isPending}
						>
							Create collection
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
});

export { CreateBookmarkCollectionModal };
