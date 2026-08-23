import { type FormEvent, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { DialogBody, DialogFooter } from "@/core/components/ui/dialog.tsx";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/core/components/ui/field.tsx";
import { Input } from "@/core/components/ui/input.tsx";
import { Textarea } from "@/core/components/ui/textarea.tsx";
import type { BookmarkCollection } from "./bookmark-collection.ts";

type BookmarkCollectionModalFormValues = {
	name: string;
	description?: string;
};

type BookmarkCollectionModalFormProps = {
	collection?: BookmarkCollection;
	isPending: boolean;
	isError: boolean;
	submitLabel: string;
	onChange?: () => void;
	onSubmit: (values: BookmarkCollectionModalFormValues) => void;
};

function BookmarkCollectionModalForm({
	collection,
	isPending,
	isError,
	submitLabel,
	onChange,
	onSubmit,
}: BookmarkCollectionModalFormProps) {
	const [name, setName] = useState(collection?.name ?? "");
	const [description, setDescription] = useState(collection?.description ?? "");

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedName = name.trim();
		if (!trimmedName || isPending) return;

		const trimmedDescription = description.trim();
		onSubmit({
			name: trimmedName,
			description: collection
				? trimmedDescription
				: trimmedDescription || undefined,
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex min-h-0 flex-1 flex-col"
			onChange={() => {
				if (isError) onChange?.();
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
							disabled={isPending}
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
							disabled={isPending}
						/>
						<FieldDescription className="text-right">
							{description.length}/280
						</FieldDescription>
					</Field>
				</FieldGroup>

				{isError ? (
					<p className="mt-4 text-sm text-destructive" role="alert">
						Unable to save this collection. Please try again.
					</p>
				) : null}
			</DialogBody>

			<DialogFooter>
				<Button
					type="submit"
					disabled={!name.trim() || isPending}
					isLoading={isPending}
				>
					{submitLabel}
				</Button>
			</DialogFooter>
		</form>
	);
}

export { BookmarkCollectionModalForm };
export type {
	BookmarkCollectionModalFormProps,
	BookmarkCollectionModalFormValues,
};
