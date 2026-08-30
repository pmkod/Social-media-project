import { useEffect, useRef, useState } from "react";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import type { Message } from "../common/discussion.ts";
import { useDiscussion } from "../hooks/use-discussion.ts";
import { useMarkDiscussionRead } from "../hooks/use-mark-discussion-read.ts";
import { DiscussionBody } from "./discussion-body.tsx";
import { DiscussionDetailLoader } from "./discussion-detail-loader.tsx";
import { DiscussionFooter } from "./discussion-footer.tsx";
import { DiscussionHeader } from "./discussion-header.tsx";

function DiscussionDetail({ discussionId }: { discussionId: string }) {
	const [replyingTo, setReplyingTo] = useState<Message | null>(null);
	const discussionQuery = useDiscussion(discussionId);
	const { data: authenticatedUserData } = useAuthenticatedUser();
	const markRead = useMarkDiscussionRead();
	const attemptedReadMarkerRef = useRef<string | null>(null);
	const discussion = discussionQuery.data?.discussion;

	useEffect(() => {
		if (!discussion || discussion.unreadCount === 0) return;
		const marker = discussion.lastMessage?.id ?? discussion.id;
		if (attemptedReadMarkerRef.current === marker) return;
		attemptedReadMarkerRef.current = marker;
		markRead.mutate({
			discussionId: discussion.id,
			messageId: discussion.lastMessage?.id,
		});
	}, [discussion, markRead.mutate]);

	if (discussionQuery.isLoading) return <DiscussionDetailLoader />;

	if (discussionQuery.isError || !discussion) {
		return (
			<div className="flex h-full items-center justify-center p-4">
				<ExceptionBlock
					borderless
					className="min-h-72"
					title="Conversation unavailable"
					description="This conversation could not be found or you no longer have access to it."
					onRefresh={() => void discussionQuery.refetch()}
					isRefetching={discussionQuery.isRefetching}
				/>
			</div>
		);
	}

	return (
		<div className="flex h-full min-h-0 flex-col">
			<DiscussionHeader
				discussion={discussion}
				authenticatedUserId={authenticatedUserData?.user.id}
			/>
			<DiscussionBody
				discussion={discussion}
				authenticatedUserId={authenticatedUserData?.user.id}
				onReply={setReplyingTo}
			/>
			<DiscussionFooter
				discussionId={discussion.id}
				isBlocked={discussion.currentUserIsBlocked}
				replyingTo={replyingTo}
				onCancelReply={() => setReplyingTo(null)}
			/>
		</div>
	);
}

export { DiscussionDetail };
