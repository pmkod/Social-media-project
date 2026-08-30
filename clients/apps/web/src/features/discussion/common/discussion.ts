import type { User } from "@/features/user/common/user.ts";
import type { DiscussionTypes } from "./discussion.constants.ts";

type DiscussionType = (typeof DiscussionTypes)[keyof typeof DiscussionTypes];
type DiscussionMemberRole = "OWNER" | "ADMIN" | "MEMBER";
type MessageMediaType = "IMAGE" | "VIDEO" | "AUDIO" | "FILE";

type DiscussionMember = {
	userId: string;
	role: DiscussionMemberRole;
	joinedAt: string;
	lastReadAt: string;
	user: User | null;
};

type ParentMessage = {
	id: string;
	senderId: string;
	content: string | null;
	isDeleted: boolean;
	hasMedia: boolean;
};

type MessageMedia = {
	id: string;
	type: MessageMediaType;
	url: string;
	fileName: string | null;
	mimeType: string | null;
	width: number | null;
	height: number | null;
};

type Message = {
	id: string;
	discussionId: string;
	senderId: string;
	content: string | null;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	editedAt: string | null;
	deletedAt: string | null;
	media: MessageMedia[];
	sender: User | null;
	parentMessage: ParentMessage | null;
};

type Discussion = {
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

type DiscussionsCursor = {
	activityAt: string;
	id: string;
};

type MessagesCursor = {
	createdAt: string;
	id: string;
};

type DiscussionsResponse = {
	discussions: Discussion[];
	pagination: {
		limit: number;
		hasNextPage: boolean;
		nextCursor: DiscussionsCursor | null;
	};
};

type DiscussionResponse = {
	discussion: Discussion;
};

type MessagesResponse = {
	messages: Message[];
	pagination: {
		limit: number;
		hasNextPage: boolean;
		nextCursor: MessagesCursor | null;
	};
};

type CreateDiscussionResponse = {
	created: boolean;
	discussion: Discussion;
};

type CreateMessageResponse = {
	message: Message;
};

type DiscussionMedia = MessageMedia & {
	createdAt: string;
	message: {
		id: string;
		senderId: string;
		content: string | null;
		createdAt: string;
	};
};

type DiscussionMediaResponse = {
	media: DiscussionMedia[];
	pagination: {
		limit: number;
		hasNextPage: boolean;
		nextCursor: { createdAt: string; id: string } | null;
	};
};

export type {
	CreateDiscussionResponse,
	CreateMessageResponse,
	Discussion,
	DiscussionMedia,
	DiscussionMediaResponse,
	DiscussionMember,
	DiscussionMemberRole,
	DiscussionResponse,
	DiscussionsCursor,
	DiscussionsResponse,
	DiscussionType,
	Message,
	MessageMedia,
	MessageMediaType,
	MessagesCursor,
	MessagesResponse,
	ParentMessage,
};
