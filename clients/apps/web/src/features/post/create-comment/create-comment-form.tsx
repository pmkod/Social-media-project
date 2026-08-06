import { RiSendPlane2Line } from "@remixicon/react";
import { useForm, useSelector } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/core/components/ui/button.tsx";
import { useCreateComment } from "./use-create-comment";

const CURRENT_USER_AVATAR =
	"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

const createCommentSchema = z.object({
	content: z.string().refine((value) => value.trim().length > 0, {
		message: "Le commentaire doit contenir du texte",
	}),
});

interface CreateCommentFormProps {
	postId: string;
	onSuccess?: () => void;
}

function CreateCommentForm({ postId, onSuccess }: CreateCommentFormProps) {
	const { mutate, isPending } = useCreateComment();

	const form = useForm({
		defaultValues: {
			content: "",
		},
		validators: {
			onSubmit: createCommentSchema,
		},
		onSubmit: async ({ value }) => {
			if (isPending) return;

			mutate(
				{
					postId,
					content: value.content.trim(),
				},
				{
					onSuccess: () => {
						form.reset();
						onSuccess?.();
					},
				},
			);
		},
	});

	const content = useSelector(form.store, (state) => state.values.content);

	const hasContent = Boolean((content || "").trim());

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="pb-4 px-4 pt-6 border-t border-border"
		>
			<div className="flex gap-3">
				<img
					src={CURRENT_USER_AVATAR}
					alt="Votre avatar"
					className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-border"
				/>

				<div className="flex-1 min-w-0 space-y-3">
					<form.Field name="content">
						{(field) => (
							<textarea
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="Poster votre réponse..."
								rows={3}
								disabled={isPending}
								className="min-h-0 w-full resize-none font-normal placeholder:font-normal border-0 bg-transparent px-0 py-0 text-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-0 ring-0 outline-none disabled:opacity-60"
							/>
						)}
					</form.Field>
				</div>
			</div>

			<div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
				<div className="flex items-center gap-2" />

				<Button type="submit" disabled={!hasContent || isPending}>
					<RiSendPlane2Line className="h-4 w-4" />
					<span>{isPending ? "Envoi..." : "Répondre"}</span>
				</Button>
			</div>
		</form>
	);
}

export { CreateCommentForm };
