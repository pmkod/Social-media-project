import { describe, expect, it } from "vitest";
import { NotificationEventTypes } from "./notification.constants.ts";
import { getNotificationPostId } from "./notification.utils.ts";

describe("getNotificationPostId", () => {
	it("gets the post id from a post comment notification", () => {
		expect(
			getNotificationPostId({
				eventType: NotificationEventTypes.POST_COMMENT,
				groupKey: "POST_COMMENT:post-1",
				targetId: "comment-1",
			}),
		).toBe("post-1");
	});

	it("gets the post id from a reply notification", () => {
		expect(
			getNotificationPostId({
				eventType: NotificationEventTypes.COMMENT_REPLY,
				groupKey: "COMMENT_REPLY:comment-1:post-1",
				targetId: "comment-2",
			}),
		).toBe("post-1");
	});

	it("gets the post id from a comment like notification", () => {
		expect(
			getNotificationPostId({
				eventType: NotificationEventTypes.COMMENT_LIKE,
				groupKey: "COMMENT_LIKE:comment-1:post-1",
				targetId: "comment-1",
			}),
		).toBe("post-1");
	});

	it("does not treat a legacy comment like key as a post id", () => {
		expect(
			getNotificationPostId({
				eventType: NotificationEventTypes.COMMENT_LIKE,
				groupKey: "COMMENT_LIKE:comment-1",
				targetId: "comment-1",
			}),
		).toBeNull();
	});

	it("uses the target id for post likes and no link for follows", () => {
		expect(
			getNotificationPostId({
				eventType: NotificationEventTypes.POST_LIKE,
				groupKey: "POST_LIKE:post-1",
				targetId: "post-1",
			}),
		).toBe("post-1");
		expect(
			getNotificationPostId({
				eventType: NotificationEventTypes.FOLLOW,
				groupKey: "FOLLOW",
				targetId: null,
			}),
		).toBeNull();
	});
});
