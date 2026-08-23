import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/core/components/ui/field.tsx";
import { Input } from "@/core/components/ui/input.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { Textarea } from "@/core/components/ui/textarea.tsx";
import { useCreateBookmarkCollection } from "../create-bookmark-collection/use-create-bookmark-collection.ts";
import { useEditBookmarkCollection } from "../edit-bookmark-collection/use-edit-bookmark-collection.ts";
import type {
	BookmarkCollection,
	BookmarkCollectionResponse,
} from "./bookmark-collection.ts";

type BookmarkCollectionModalFormValues = {
	name: string;
	description?: string;
};

type BookmarkCollectionModalProps = {
	collection?: BookmarkCollection;
};

const bookmarkCollectionSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Collection name is required")
		.max(60, "Collection name must be 60 characters or less"),
	description: z
		.string()
		.max(280, "Description must be 280 characters or less"),
});

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

		const handleSuccess = ({
			bookmarkCollection,
		}: BookmarkCollectionResponse) => {
			modal.resolve(bookmarkCollection);
			modal.remove();
		};

		const form = useForm({
			defaultValues: {
				name: collection?.name ?? "",
				description: collection?.description ?? "",
			},
			validators: {
				onSubmit: bookmarkCollectionSchema,
			},
			onSubmit: async ({ value }) => {
				if (mutation.isPending) return;

				const trimmedDescription = value.description.trim();
				const values: BookmarkCollectionModalFormValues = {
					name: value.name.trim(),
					description: isEditing
						? trimmedDescription
						: trimmedDescription || undefined,
				};

				try {
					if (collection) {
						const response = await editCollection.mutateAsync({
							collectionId: collection.id,
							...values,
						});
						handleSuccess(response);
						return;
					}

					const response = await createCollection.mutateAsync(values);
					handleSuccess(response);
				} catch {
					// The mutation error is displayed below the fields.
				}
			},
		});

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

					<form
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
						className="flex min-h-0 flex-1 flex-col"
						onChange={() => {
							if (mutation.isError) mutation.reset();
						}}
					>
						<DialogBody className="px-5 py-5">
							<FieldGroup>
								<form.Field name="name">
									{(field) => (
										<Field data-invalid={!field.state.meta.isValid}>
											<FieldLabel htmlFor={field.name}>Name</FieldLabel>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												placeholder="e.g. Read later"
												maxLength={60}
												autoFocus
												disabled={mutation.isPending}
												aria-invalid={!field.state.meta.isValid}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>

								<form.Field name="description">
									{(field) => (
										<Field data-invalid={!field.state.meta.isValid}>
											<FieldLabel htmlFor={field.name}>Description</FieldLabel>
											<Textarea
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												placeholder="What will you save here?"
												maxLength={280}
												rows={3}
												disabled={mutation.isPending}
												aria-invalid={!field.state.meta.isValid}
											/>
											<FieldDescription className="text-right">
												{field.state.value.length}/280
											</FieldDescription>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>
							</FieldGroup>

							{mutation.isError ? (
								<p className="mt-4 text-sm text-destructive" role="alert">
									Unable to save this collection. Please try again.
								</p>
							) : null}
						</DialogBody>

						<DialogFooter>
							<form.Subscribe selector={(state) => state.isSubmitting}>
								{(isSubmitting) => (
									<Button
										type="submit"
										disabled={isSubmitting || mutation.isPending}
										isLoading={isSubmitting || mutation.isPending}
									>
										{isEditing ? "Save changes" : "Create collection"}
									</Button>
								)}
							</form.Subscribe>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		);
	},
);

export { BookmarkCollectionModal };
export type { BookmarkCollectionModalFormValues, BookmarkCollectionModalProps };
