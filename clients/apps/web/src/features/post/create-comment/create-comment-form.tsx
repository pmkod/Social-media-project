import { RiSendPlane2Line } from "@remixicon/react";
import { useForm, useSelector } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/core/components/ui/button.tsx";
import { useAuthenticatedUser } from "@/features/user/get-authenticated-user/use-authenticated-user.ts";
import type { Comment } from "../common/comment.ts";
import { useCreateComment } from "./use-create-comment";
import { useCreateCommentReply } from "./use-create-comment-reply.ts";

const createCommentSchema = z.object({
	content: z.string().refine((value) => value.trim().length > 0, {
		message: "Le commentaire doit contenir du texte",
	}),
});

type CreateCommentFormProps = {
	postId: string;
	parentComment?: Comment;
	onSuccess?: () => void;
};

function CreateCommentForm({
	postId,
	parentComment,
	onSuccess,
}: CreateCommentFormProps) {
	const createComment = useCreateComment();
	const createReply = useCreateCommentReply();
	const { data: authenticatedUser } = useAuthenticatedUser();
	const isPending = createComment.isPending || createReply.isPending;

	const form = useForm({
		defaultValues: {
			content: "",
		},
		validators: {
			onSubmit: createCommentSchema,
		},
		onSubmit: async ({ value }) => {
			if (isPending) return;

			const mutationOptions = {
				onSuccess: () => {
					form.reset();
					onSuccess?.();
				},
			};

			if (parentComment) {
				createReply.mutate(
					{ comment: parentComment, content: value.content.trim() },
					mutationOptions,
				);
				return;
			}

			createComment.mutate(
				{ postId, content: value.content.trim() },
				mutationOptions,
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
					src={
						authenticatedUser?.avatarUrl ||
						`https://ui-avatars.com/api/?name=${encodeURIComponent(
							authenticatedUser?.fullName || authenticatedUser?.username || "U",
						)}&background=random`
					}
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
								placeholder={
									parentComment
										? `Répondre à @${parentComment.author?.handle ?? "utilisateur"}...`
										: "Poster votre commentaire..."
								}
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
					<span>
						{isPending ? "Envoi..." : parentComment ? "Répondre" : "Commenter"}
					</span>
				</Button>
			</div>
		</form>
	);
}

export { CreateCommentForm };
