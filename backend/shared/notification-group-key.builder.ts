import { NotificationEventTypes } from "./notification.constants";

const buildCommentReplyGroupKeyPrefix = (parentCommentId: string): string =>
	`${NotificationEventTypes.COMMENT_REPLY}:${parentCommentId}:`;

const NotificationGroupKeyBuilder = {
	buildFollow: (): string => NotificationEventTypes.FOLLOW,
	buildPostLike: (postId: string): string =>
		`${NotificationEventTypes.POST_LIKE}:${postId}`,
	buildCommentLike: (commentId: string, postId: string): string =>
		`${NotificationEventTypes.COMMENT_LIKE}:${commentId}:${postId}`,
	buildPostComment: (postId: string): string =>
		`${NotificationEventTypes.POST_COMMENT}:${postId}`,
	buildCommentReply: (parentCommentId: string, postId: string): string =>
		`${buildCommentReplyGroupKeyPrefix(parentCommentId)}${postId}`,
	buildCommentReplyPrefix: buildCommentReplyGroupKeyPrefix,
};

export { NotificationGroupKeyBuilder };
