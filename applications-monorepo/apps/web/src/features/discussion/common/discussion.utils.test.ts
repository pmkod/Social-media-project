import { describe, expect, it } from "vitest";
import { DiscussionTypes } from "./discussion.constants.ts";
import type { Discussion, DiscussionMember } from "./discussion.ts";
import {
	getDiscussionSubtitle,
	getDiscussionTitle,
	getMessagePreview,
	isSameMessageDay,
} from "./discussion.utils.ts";

const member = (
	userId: string,
	fullName: string,
	username: string,
): DiscussionMember => ({
	userId,
	role: "MEMBER",
	joinedAt: "2026-08-29T10:00:00.000Z",
	lastReadAt: "2026-08-29T10:00:00.000Z",
	user: { id: userId, fullName, username },
});

const discussion = (overrides: Partial<Discussion> = {}): Discussion => ({
	id: "discussion-1",
	type: DiscussionTypes.PRIVATE,
	name: null,
	description: null,
	isStarted: false,
	creatorId: "user-1",
	lastActivityAt: "2026-08-29T10:00:00.000Z",
	createdAt: "2026-08-29T10:00:00.000Z",
	updatedAt: "2026-08-29T10:00:00.000Z",
	currentUserRole: "MEMBER",
	unreadCount: 0,
	members: [
		member("user-1", "Current user", "current"),
		member("user-2", "Awa Koné", "awa"),
	],
	lastMessage: null,
	...overrides,
});

describe("discussion display helpers", () => {
	it("uses the other member for a private discussion", () => {
		const value = discussion();

		expect(getDiscussionTitle(value, "user-1")).toBe("Awa Koné");
		expect(getDiscussionSubtitle(value, "user-1")).toBe("@awa");
	});

	it("uses the group name and member count for a group", () => {
		const value = discussion({
			type: DiscussionTypes.GROUP,
			name: "Design team",
		});

		expect(getDiscussionTitle(value, "user-1")).toBe("Design team");
		expect(getDiscussionSubtitle(value, "user-1")).toBe("2 members");
	});

	it("prefixes the authenticated user's last message", () => {
		const value = discussion({
			lastMessage: {
				id: "message-1",
				discussionId: "discussion-1",
				senderId: "user-1",
				content: "Hello",
				isDeleted: false,
				createdAt: "2026-08-29T10:00:00.000Z",
				updatedAt: "2026-08-29T10:00:00.000Z",
				editedAt: null,
				deletedAt: null,
				sender: null,
				parentMessage: null,
			},
		});

		expect(getMessagePreview(value, "user-1")).toBe("You: Hello");
	});

	it("recognizes messages sent on the same calendar day", () => {
		expect(
			isSameMessageDay("2026-08-29T08:00:00.000Z", "2026-08-29T16:00:00.000Z"),
		).toBe(true);
		expect(
			isSameMessageDay("2026-08-29T08:00:00.000Z", "2026-08-30T08:00:00.000Z"),
		).toBe(false);
	});
});
