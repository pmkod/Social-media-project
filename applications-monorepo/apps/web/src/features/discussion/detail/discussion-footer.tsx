import {
	RiCloseLine,
	RiEmotionHappyLine,
	RiImageLine,
	RiSendPlane2Fill,
} from "@remixicon/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmojiPickerPopover } from "@/core/components/ui/emoji-picker.tsx";
import { IconButton } from "@/core/components/ui/icon-button.tsx";
import { useSelectFiles } from "@/core/hooks/use-select-files.ts";
import { insertTextAtSelection } from "@/core/lib/text-selection.ts";
import * as m from "@/paraglide/messages.js";
import {
	MESSAGE_IMAGE_MAX_COUNT,
	MESSAGE_IMAGE_MAX_FILE_SIZE,
	MESSAGE_IMAGE_MIME_TYPES,
	MESSAGE_MAX_LENGTH,
} from "../common/discussion.constants.ts";
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
	const [images, setImages] = useState<File[]>([]);
	const [imageError, setImageError] = useState<string | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const createMessage = useCreateMessage();
	const { selectFiles } = useSelectFiles();
	const imagePreviews = useMemo(
		() => images.map((image) => ({ image, url: URL.createObjectURL(image) })),
		[images],
	);

	useEffect(
		() => () => {
			for (const preview of imagePreviews) URL.revokeObjectURL(preview.url);
		},
		[imagePreviews],
	);

	useEffect(() => {
		if (replyingTo) textareaRef.current?.focus();
	}, [replyingTo]);

	const sendMessage = async () => {
		const normalizedContent = content.trim();
		if ((!normalizedContent && images.length === 0) || createMessage.isPending)
			return;

		try {
			await createMessage.mutateAsync({
				discussionId,
				content: normalizedContent || undefined,
				images,
				parentMessageId: replyingTo?.id,
			});
			setContent("");
			setImages([]);
			setImageError(null);
			onCancelReply();
			requestAnimationFrame(() => textareaRef.current?.focus());
		} catch {
			// The mutation error is displayed below the composer.
		}
	};

	const handleImageSelect = async () => {
		setImageError(null);
		const selectedImages = await selectFiles({
			accept: MESSAGE_IMAGE_MIME_TYPES.join(","),
			multiple: true,
		});
		if (!selectedImages.length) return;

		if (
			selectedImages.some(
				(image) =>
					!MESSAGE_IMAGE_MIME_TYPES.includes(
						image.type as (typeof MESSAGE_IMAGE_MIME_TYPES)[number],
					) ||
					image.size === 0 ||
					image.size > MESSAGE_IMAGE_MAX_FILE_SIZE,
			)
		) {
			setImageError(m.composer_invalid_media());
			return;
		}
		if (images.length + selectedImages.length > MESSAGE_IMAGE_MAX_COUNT) {
			setImageError(
				m.composer_too_many_files({ maxMedia: MESSAGE_IMAGE_MAX_COUNT }),
			);
			return;
		}

		setImages((current) => [...current, ...selectedImages]);
		if (createMessage.isError) createMessage.reset();
	};

	const handleEmojiSelect = (emoji: string) => {
		const textarea = textareaRef.current;
		const insertion = insertTextAtSelection(
			content,
			emoji,
			{
				start: textarea?.selectionStart,
				end: textarea?.selectionEnd,
			},
			MESSAGE_MAX_LENGTH,
		);

		if (!insertion) return;

		setContent(insertion.value);
		if (createMessage.isError) createMessage.reset();
		requestAnimationFrame(() => {
			textarea?.focus();
			textarea?.setSelectionRange(insertion.caret, insertion.caret);
		});
	};

	return (
		<footer className="shrink-0 border-t border-border bg-background px-3 py-3 sm:px-4">
			{isBlocked ? (
				<p className="py-2 text-center text-sm text-muted-foreground">
					{m.discussion_blocked_composer()}
				</p>
			) : (
				<div className="">
					{replyingTo ? (
						<div className="mb-2 flex items-center gap-3 rounded-xl border border-border bg-accent px-3 py-2">
							<div className="min-w-0 flex-1 border-l-2 border-primary pl-2.5">
								<p className="text-xs font-semibold text-primary">
									{m.discussion_replying_to()}
								</p>
								<p className="truncate text-xs text-muted-foreground">
									{replyingTo.content || m.discussion_message()}
								</p>
							</div>
							<button
								type="button"
								onClick={onCancelReply}
								aria-label={m.discussion_cancel_reply()}
								className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
							>
								<RiCloseLine className="size-4" />
							</button>
						</div>
					) : null}

					{imagePreviews.length > 0 ? (
						<div className="mb-2 flex gap-2 overflow-x-auto pb-1">
							{imagePreviews.map(({ image, url }, index) => (
								<div
									key={`${image.name}-${image.lastModified}-${image.size}`}
									className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
								>
									<img
										src={url}
										alt={m.composer_image_preview({ index: index + 1 })}
										className="size-full object-cover"
									/>
									<button
										type="button"
										onClick={() =>
											setImages((current) =>
												current.filter((_, itemIndex) => itemIndex !== index),
											)
										}
										disabled={createMessage.isPending}
										aria-label={m.composer_remove_media()}
										className="absolute top-1 right-1 inline-flex size-6 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:opacity-50"
									>
										<RiCloseLine className="size-4" />
									</button>
								</div>
							))}
						</div>
					) : null}

					<form
						onSubmit={(event) => {
							event.preventDefault();
							void sendMessage();
						}}
						className="flex items-end gap-2"
					>
						<EmojiPickerPopover
							onEmojiSelect={handleEmojiSelect}
							align="start"
							side="top"
						>
							<IconButton
								type="button"
								variant="ghost"
								size="lg"
								className="rounded-full"
								disabled={createMessage.isPending}
								aria-label={m.emoji_picker_trigger()}
							>
								<RiEmotionHappyLine />
							</IconButton>
						</EmojiPickerPopover>
						<IconButton
							type="button"
							variant="ghost"
							size="lg"
							className="rounded-full"
							disabled={
								createMessage.isPending ||
								images.length >= MESSAGE_IMAGE_MAX_COUNT
							}
							onClick={() => void handleImageSelect()}
							aria-label={m.composer_media()}
						>
							<RiImageLine />
						</IconButton>
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
							maxLength={MESSAGE_MAX_LENGTH}
							disabled={createMessage.isPending}
							placeholder={m.discussion_write_message()}
							aria-label={m.discussion_message()}
							className="max-h-32 min-h-11 flex-1 resize-none rounded-full border border-input bg-accent px-4 py-2.5 text-sm leading-5 outline-none transition placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
						/>
						<IconButton
							type="submit"
							size="lg"
							className="rounded-full"
							disabled={!content.trim() && images.length === 0}
							isLoading={createMessage.isPending}
							aria-label={m.discussion_send_message()}
						>
							<RiSendPlane2Fill />
						</IconButton>
					</form>
					{imageError || createMessage.isError ? (
						<p className="mt-2 px-1 text-xs text-destructive" role="alert">
							{imageError || (createMessage.error as Error)?.message}
						</p>
					) : null}
				</div>
			)}
		</footer>
	);
}

export { DiscussionFooter };
