import { RiReplyLine } from "@remixicon/react";
import { cn } from "@/core/lib/utils.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import type { Message } from "../common/discussion.ts";
import { formatMessageTime } from "../common/discussion.utils.ts";

type MessageItemProps = {
	message: Message;
	isOwn: boolean;
	showSender: boolean;
	showAvatar: boolean;
	onReply: (message: Message) => void;
};

function MessageItem({
	message,
	isOwn,
	showSender,
	showAvatar,
	onReply,
}: MessageItemProps) {
	const bubble = (
		<div
			className={cn(
				"max-w-[min(78vw,32rem)] rounded-2xl px-3.5 py-2.5 text-sm leading-5 shadow-xs sm:max-w-[75%]",
				isOwn
					? "rounded-br-md bg-primary text-primary-foreground"
					: "rounded-bl-md border border-border bg-muted/70 text-foreground",
				message.isDeleted && "italic",
			)}
		>
			{showSender && !isOwn && message.sender ? (
				<p className="mb-1 text-xs font-semibold text-primary">
					{message.sender.fullName || `@${message.sender.username}`}
				</p>
			) : null}

			{message.parentMessage ? (
				<div
					className={cn(
						"mb-2 rounded-lg border-l-2 px-2.5 py-1.5 text-xs",
						isOwn
							? "border-primary-foreground/70 bg-black/10 text-primary-foreground/85"
							: "border-primary bg-background/70 text-muted-foreground",
					)}
				>
					<p className="line-clamp-2">
						{message.parentMessage.isDeleted
							? "Original message deleted"
							: message.parentMessage.content}
					</p>
				</div>
			) : null}

			<p className="whitespace-pre-wrap break-words">
				{message.isDeleted ? "Message deleted" : message.content}
			</p>
			<div
				className={cn(
					"mt-1 flex items-center justify-end gap-1 text-[10px]",
					isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
				)}
			>
				{message.editedAt && !message.isDeleted ? <span>Edited</span> : null}
				<span>{formatMessageTime(message.createdAt)}</span>
			</div>
		</div>
	);

	const replyButton = !message.isDeleted ? (
		<button
			type="button"
			onClick={() => onReply(message)}
			aria-label="Reply to message"
			className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-100 transition hover:bg-accent hover:text-foreground focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
		>
			<RiReplyLine className="size-4" />
		</button>
	) : null;

	return (
		<div
			className={cn(
				"group flex items-end gap-2",
				isOwn ? "justify-end" : "justify-start",
			)}
		>
			{!isOwn ? (
				showAvatar ? (
					<UserAvatar user={message.sender ?? undefined} size="sm" />
				) : (
					<div className="size-8 shrink-0" aria-hidden="true" />
				)
			) : null}
			{isOwn ? replyButton : null}
			{bubble}
			{!isOwn ? replyButton : null}
		</div>
	);
}

export { MessageItem };
