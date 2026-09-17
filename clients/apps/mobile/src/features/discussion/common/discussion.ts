import type { User } from "@/features/user/common/user";
import type { DiscussionType } from "./discussion.constants";

export type DiscussionMemberRole = "OWNER" | "ADMIN" | "MEMBER";

export type DiscussionMember = {
	userId: string;
	role: DiscussionMemberRole;
	joinedAt: string;
	lastReadAt: string;
	user: User | null;
};

export type Message = {
	id: string;
	discussionId: string;
	senderId: string;
	content: string | null;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	sender: User | null;
};

export type Discussion = {
	id: string;
	type: DiscussionType;
	name: string | null;
	description: string | null;
	isStarted: boolean;
	creatorId: string;
	lastActivityAt: string;
	createdAt: string;
	updatedAt: string;
	currentUserRole: DiscussionMemberRole | null;
	currentUserIsBlocked: boolean;
	unreadCount: number;
	members: DiscussionMember[];
	lastMessage: Message | null;
};

export type DiscussionsCursor = {
	activityAt: string;
	id: string;
};

export type MessagesCursor = {
	createdAt: string;
	id: string;
};

export type DiscussionsResponse = {
	discussions: Discussion[];
	pagination: {
		limit: number;
		hasNextPage: boolean;
		nextCursor: DiscussionsCursor | null;
	};
};

export type DiscussionResponse = {
	discussion: Discussion;
};

export type MessagesResponse = {
	messages: Message[];
	pagination: {
		limit: number;
		hasNextPage: boolean;
		nextCursor: MessagesCursor | null;
	};
};

export type CreateDiscussionResponse = {
	created: boolean;
	discussion: Discussion;
};

export type CreateMessageResponse = {
	message: Message;
};
export type { DiscussionType } from "./discussion.constants";
