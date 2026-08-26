import { RiSendPlane2Line } from "@remixicon/react";
import { useForm, useSelector } from "@tanstack/react-form";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { Button } from "@/core/components/ui/button.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { useCommentToReplyTo } from "../comment-to-reply-to/use-comment-to-reply-to.ts";
import { useCreateComment } from "./use-create-comment.ts";

const createCommentSchema = z.object({
	content: z.string().refine((value) => value.trim().length > 0, {
		message: "Comment cannot be empty",
	}),
});

type CreateCommentFormProps = {
	postId: string;
	onSuccess?: () => void;
	autoFocus?: boolean;
};

function CreateCommentForm({
	postId,
	onSuccess,
	autoFocus,
}: CreateCommentFormProps) {
	const createComment = useCreateComment();
	const { commentToReplyTo, clearCommentToReplyTo } = useCommentToReplyTo();
	const { data } = useAuthenticatedUser();
	const authenticatedUser = data?.user;
	const parentComment =
		commentToReplyTo?.postId === postId ? commentToReplyTo : null;

	const isPending = createComment.isPending;
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (commentToReplyTo && commentToReplyTo.postId !== postId) {
			clearCommentToReplyTo();
			return;
		}

		if ((autoFocus || parentComment) && textareaRef.current) {
			textareaRef.current.focus();
			textareaRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, [
		autoFocus,
		clearCommentToReplyTo,
		commentToReplyTo,
		parentComment,
		postId,
	]);

	useEffect(() => clearCommentToReplyTo, [clearCommentToReplyTo]);

	const form = useForm({
		defaultValues: {
			content: "",
		},
		validators: {
			onSubmit: createCommentSchema,
		},
		onSubmit: async ({ value }) => {
			if (isPending) return;

			createComment.mutate(
				{
					postId,
					content: value.content.trim(),
					parentCommentId: parentComment ? parentComment.id : undefined,
				},
				{
					onSuccess: () => {
						form.reset();
						clearCommentToReplyTo();
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
		>
			{parentComment ? (
				<div className="mb-2 flex items-center justify-between gap-3 text-sm text-muted-foreground">
					<span>Replying to @{parentComment.author?.username ?? "user"}</span>
					<button
						type="button"
						onClick={clearCommentToReplyTo}
						aria-label="Cancel reply"
						className="rounded-full p-1 transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
					>
						<X className="size-4" />
					</button>
				</div>
			) : null}
			<div className="flex gap-3">
				<UserAvatar user={authenticatedUser} size="md" />

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
										? `Reply to @${parentComment.author?.username ?? "user"}...`
										: "Post your comment..."
								}
								disabled={isPending}
								className="min-h-0 w-full resize-none rounded-lg py-2 font-normal placeholder:font-normal bg-transparent text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 ring-0 outline-none disabled:opacity-60"
							/>
						)}
					</form.Field>
				</div>
				<Button type="submit" disabled={!hasContent || isPending}>
					<RiSendPlane2Line className="h-4 w-4" />
					{parentComment ? "Reply" : "Comment"}
				</Button>
			</div>

			<div className="mt-3 flex items-center justify-between pt-2">
				<div className="flex items-center gap-2" />
			</div>
		</form>
	);
}

export { CreateCommentForm };
