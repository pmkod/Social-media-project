import { useEffect, useRef } from "react";
import { RiSendPlane2Line } from "@remixicon/react";
import { useForm, useSelector } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/core/components/ui/button.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import type { Comment } from "../common/comment.ts";
import { useCreateComment } from "./use-create-comment.ts";
import { useCreateCommentReply } from "./use-create-comment-reply.ts";

const createCommentSchema = z.object({
	content: z.string().refine((value) => value.trim().length > 0, {
		message: "Comment cannot be empty",
	}),
});

type CreateCommentFormProps = {
	postId: string;
	parentComment?: Comment;
	onSuccess?: () => void;
	autoFocus?: boolean;
};

function CreateCommentForm({
	postId,
	parentComment,
	onSuccess,
	autoFocus,
}: CreateCommentFormProps) {
	const createComment = useCreateComment();
	const createReply = useCreateCommentReply();
	const { data: authenticatedUser } = useAuthenticatedUser();
	const isPending = createComment.isPending || createReply.isPending;
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (autoFocus && textareaRef.current) {
			textareaRef.current.focus();
			textareaRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, [autoFocus]);

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
		>
			<div className="flex gap-3">
				<img
					src={
						authenticatedUser?.avatarUrl ||
						`https://ui-avatars.com/api/?name=${encodeURIComponent(
							authenticatedUser?.fullName || authenticatedUser?.username || "U",
						)}&background=random`
					}
					alt="Your avatar"
					className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-border"
				/>

				<div className="flex-1 min-w-0 space-y-3">
					<form.Field name="content">
						{(field) => (
							<textarea
								ref={textareaRef}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder={
									parentComment
										? `Reply to @${parentComment.author?.handle ?? "user"}...`
										: "Post your comment..."
								}
								disabled={isPending}
								autoFocus={autoFocus || false}
								className="min-h-0 w-full resize-none rounded-lg py-2 font-normal placeholder:font-normal bg-transparent text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 ring-0 outline-none disabled:opacity-60"
							/>
						)}
					</form.Field>
				</div>
				<Button type="submit" disabled={!hasContent || isPending}>
					<RiSendPlane2Line className="h-4 w-4" />
					Comment
				</Button>
			</div>

			<div className="mt-3 flex items-center justify-between pt-2">
				<div className="flex items-center gap-2" />
			</div>
		</form>
	);
}

export { CreateCommentForm };
export type { CreateCommentFormProps };
