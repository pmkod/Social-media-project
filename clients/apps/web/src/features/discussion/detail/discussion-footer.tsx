import { RiCloseLine, RiSendPlane2Fill } from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/core/components/ui/icon-button.tsx";
import type { Message } from "../common/discussion.ts";
import { useCreateMessage } from "../hooks/use-create-message.ts";

type DiscussionFooterProps = {
	discussionId: string;
	isBlocked?: boolean;
	replyingTo: Message | null;
	onCancelReply: () => void;
};

function DiscussionFooter({
	discussionId,
	isBlocked = false,
	replyingTo,
	onCancelReply,
}: DiscussionFooterProps) {
	const [content, setContent] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const createMessage = useCreateMessage();

	useEffect(() => {
		if (replyingTo) textareaRef.current?.focus();
	}, [replyingTo]);

	const sendMessage = async () => {
		const normalizedContent = content.trim();
		if (!normalizedContent || createMessage.isPending) return;

		try {
			await createMessage.mutateAsync({
				discussionId,
				content: normalizedContent,
				parentMessageId: replyingTo?.id,
			});
			setContent("");
			onCancelReply();
			requestAnimationFrame(() => textareaRef.current?.focus());
		} catch {
			// The mutation error is displayed below the composer.
		}
	};

	return (
		<footer className="shrink-0 border-t border-border bg-background px-3 py-3 sm:px-4">
			{isBlocked ? (
				<p className="py-2 text-center text-sm text-muted-foreground">
					Cette discussion est bloquée. Débloquez-la depuis ses informations
					pour envoyer un message.
				</p>
			) : (
				<div className="">
					{replyingTo ? (
						<div className="mb-2 flex items-center gap-3 rounded-xl border border-border bg-muted/60 px-3 py-2">
							<div className="min-w-0 flex-1 border-l-2 border-primary pl-2.5">
								<p className="text-xs font-semibold text-primary">
									Replying to
								</p>
								<p className="truncate text-xs text-muted-foreground">
									{replyingTo.content || "Message"}
								</p>
							</div>
							<button
								type="button"
								onClick={onCancelReply}
								aria-label="Cancel reply"
								className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
							>
								<RiCloseLine className="size-4" />
							</button>
						</div>
					) : null}

					<form
						onSubmit={(event) => {
							event.preventDefault();
							void sendMessage();
						}}
						className="flex items-end gap-2"
					>
						<textarea
							ref={textareaRef}
							value={content}
							onChange={(event) => {
								setContent(event.target.value);
								if (createMessage.isError) createMessage.reset();
							}}
							onKeyDown={(event) => {
								if (
									event.key === "Enter" &&
									!event.shiftKey &&
									!event.nativeEvent.isComposing
								) {
									event.preventDefault();
									void sendMessage();
								}
							}}
							rows={1}
							maxLength={4000}
							disabled={createMessage.isPending}
							placeholder="Write a message"
							aria-label="Message"
							className="max-h-32 min-h-11 flex-1 resize-none rounded-full border border-input bg-muted/60 px-4 py-2.5 text-sm leading-5 outline-none transition placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
						/>
						<IconButton
							type="submit"
							size="lg"
							className="rounded-full"
							disabled={!content.trim()}
							isLoading={createMessage.isPending}
							aria-label="Send message"
						>
							<RiSendPlane2Fill />
						</IconButton>
					</form>
					{createMessage.isError ? (
						<p className="mt-2 px-1 text-xs text-destructive" role="alert">
							{createMessage.error instanceof Error &&
							createMessage.error.message
								? createMessage.error.message
								: "Unable to send this message. Please try again."}
						</p>
					) : null}
				</div>
			)}
		</footer>
	);
}

export { DiscussionFooter };
