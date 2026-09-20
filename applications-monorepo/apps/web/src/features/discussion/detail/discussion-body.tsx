import { RiLoader4Line } from "@remixicon/react";
import { useEffect, useMemo, useRef } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import * as m from "@/paraglide/messages.js";
import { DiscussionTypes } from "../common/discussion.constants.ts";
import type { Discussion, Message } from "../common/discussion.ts";
import {
	formatMessageDay,
	isSameMessageDay,
} from "../common/discussion.utils.ts";
import { useMessages } from "../hooks/use-messages.ts";
import { MessageItem } from "./message-item.tsx";

function MessageListLoader() {
	return (
		<div className="space-y-4 px-4 py-6">
			<div className="flex justify-start gap-2">
				<Skeleton className="size-8 rounded-full" />
				<Skeleton className="h-16 w-2/3 max-w-sm rounded-2xl" />
			</div>
			<div className="flex justify-end">
				<Skeleton className="h-14 w-1/2 max-w-xs rounded-2xl" />
			</div>
			<div className="flex justify-start gap-2">
				<Skeleton className="size-8 rounded-full" />
				<Skeleton className="h-20 w-3/4 max-w-md rounded-2xl" />
			</div>
		</div>
	);
}

type DiscussionBodyProps = {
	discussion: Discussion;
	authenticatedUserId?: string;
	onReply: (message: Message) => void;
};

function DiscussionBody({
	discussion,
	authenticatedUserId,
	onReply,
}: DiscussionBodyProps) {
	const messagesQuery = useMessages(discussion.id);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const latestMessageIdRef = useRef<string | null>(null);
	const messages = useMemo(
		() =>
			(messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [])
				.slice()
				.reverse(),
		[messagesQuery.data?.pages],
	);
	const latestMessageId = messages.at(-1)?.id ?? null;

	useEffect(() => {
		if (!latestMessageId || latestMessageIdRef.current === latestMessageId) {
			return;
		}
		const isFirstMessageRender = latestMessageIdRef.current === null;
		latestMessageIdRef.current = latestMessageId;
		const container = scrollContainerRef.current;
		if (!container) return;

		const isNearBottom =
			container.scrollHeight - container.scrollTop - container.clientHeight <
			160;
		if (isFirstMessageRender || isNearBottom) {
			requestAnimationFrame(() => {
				container.scrollTo({
					top: container.scrollHeight,
					behavior: isFirstMessageRender ? "auto" : "smooth",
				});
			});
		}
	}, [latestMessageId]);

	const loadEarlierMessages = async () => {
		const container = scrollContainerRef.current;
		const previousHeight = container?.scrollHeight ?? 0;
		const previousScrollTop = container?.scrollTop ?? 0;
		await messagesQuery.fetchNextPage();
		requestAnimationFrame(() => {
			const currentContainer = scrollContainerRef.current;
			if (!currentContainer) return;

			currentContainer.scrollTop =
				previousScrollTop + currentContainer.scrollHeight - previousHeight;
		});
	};

	const handleScroll = () => {
		const container = scrollContainerRef.current;
		if (
			!container ||
			container.scrollTop > 80 ||
			!messagesQuery.hasNextPage ||
			messagesQuery.isFetchingNextPage
		) {
			return;
		}

		void loadEarlierMessages();
	};

	return (
		<div
			ref={scrollContainerRef}
			onScroll={handleScroll}
			className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/15"
		>
			{messagesQuery.isLoading ? (
				<MessageListLoader />
			) : messagesQuery.isError ? (
				<ExceptionBlock
					bordered={false}
					className="h-full min-h-72"
					title="Unable to load messages"
					description={(messagesQuery.error as Error)?.message}
					onRefresh={() => void messagesQuery.refetch()}
					isRefetching={messagesQuery.isRefetching}
				/>
			) : messages.length === 0 ? (
				<EmptyBlock
					bordered={false}
					title={m.discussion_no_messages_title()}
					description={m.discussion_no_messages_description()}
				/>
			) : (
				<div className="mx-auto flex w-full flex-col px-3 py-5 sm:px-5">
					{messagesQuery.isFetchingNextPage ? (
						<div className="flex justify-center py-2" role="status">
							<RiLoader4Line
								aria-label="Loading earlier messages"
								className="size-4 animate-spin text-muted-foreground"
							/>
						</div>
					) : null}

					<div className="space-y-1.5">
						{messages.map((message, index) => {
							const previousMessage = messages[index - 1];
							const nextMessage = messages[index + 1];
							const showDay = !isSameMessageDay(
								message.createdAt,
								previousMessage?.createdAt,
							);
							const isOwn = message.senderId === authenticatedUserId;
							const showSender =
								discussion.type === DiscussionTypes.GROUP &&
								!isOwn &&
								(previousMessage?.senderId !== message.senderId || showDay);
							const showAvatar =
								!isOwn &&
								(nextMessage?.senderId !== message.senderId ||
									!isSameMessageDay(message.createdAt, nextMessage?.createdAt));

							return (
								<div key={message.id}>
									{showDay ? (
										<div className="my-5 flex items-center justify-center gap-3">
											<span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-xs">
												{formatMessageDay(message.createdAt)}
											</span>
										</div>
									) : null}
									<MessageItem
										message={message}
										isOwn={isOwn}
										showSender={showSender}
										showAvatar={showAvatar}
										onReply={onReply}
									/>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

export { DiscussionBody, MessageListLoader };
