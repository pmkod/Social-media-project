import * as m from "@/paraglide/messages.js";
import { getLocale } from "@/paraglide/runtime.js";
import { DiscussionTypes } from "./discussion.constants.ts";
import type { Discussion } from "./discussion.ts";

const getOtherDiscussionMember = (
	discussion: Discussion,
	authenticatedUserId?: string,
) =>
	discussion.members.find((member) => member.userId !== authenticatedUserId) ??
	null;

const getDiscussionTitle = (
	discussion: Discussion,
	authenticatedUserId?: string,
) => {
	if (discussion.type === DiscussionTypes.GROUP) {
		return discussion.name || m.discussion_untitled_group();
	}

	const otherMember = getOtherDiscussionMember(discussion, authenticatedUserId);
	return (
		otherMember?.user?.fullName ||
		(otherMember?.user
			? `@${otherMember.user.username}`
			: m.discussion_unavailable_user())
	);
};

const getDiscussionSubtitle = (
	discussion: Discussion,
	authenticatedUserId?: string,
) => {
	if (discussion.type === DiscussionTypes.GROUP) {
		const count = discussion.members.length;
		return count === 1
			? m.discussion_member({ count })
			: m.discussion_members({ count });
	}

	const otherMember = getOtherDiscussionMember(discussion, authenticatedUserId);
	return otherMember?.user
		? `@${otherMember.user.username}`
		: m.discussion_private_message();
};

const getMessagePreview = (
	discussion: Discussion,
	authenticatedUserId?: string,
) => {
	const message = discussion.lastMessage;
	if (!message) return m.discussion_start_preview();
	if (message.isDeleted) return m.discussion_message_deleted();

	const prefix =
		message.senderId === authenticatedUserId
			? m.discussion_you_prefix()
			: discussion.type === DiscussionTypes.GROUP && message.sender
				? `${message.sender.fullName || `@${message.sender.username}`}: `
				: "";
	return `${prefix}${message.content || (message.media.length ? m.discussion_media() : "")}`;
};

const formatDiscussionDate = (dateInput: string) => {
	const date = new Date(dateInput);
	if (Number.isNaN(date.getTime())) return "";

	const now = new Date();
	if (date.toDateString() === now.toDateString()) {
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}

	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (date.toDateString() === yesterday.toDateString())
		return m.discussion_yesterday();

	const daysDifference = Math.floor(
		(now.getTime() - date.getTime()) / 86_400_000,
	);
	if (daysDifference < 7) {
		return date.toLocaleDateString(getLocale(), { weekday: "short" });
	}

	return date.toLocaleDateString(getLocale(), {
		month: "short",
		day: "numeric",
		...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
	});
};

const formatMessageTime = (dateInput: string) => {
	const date = new Date(dateInput);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatMessageDay = (dateInput: string) => {
	const date = new Date(dateInput);
	if (Number.isNaN(date.getTime())) return "";

	const today = new Date();
	if (date.toDateString() === today.toDateString()) return m.discussion_today();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	if (date.toDateString() === yesterday.toDateString())
		return m.discussion_yesterday();

	return date.toLocaleDateString(getLocale(), {
		weekday: "short",
		month: "short",
		day: "numeric",
		...(date.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
	});
};

const isSameMessageDay = (firstDate: string, secondDate?: string) => {
	if (!secondDate) return false;
	return (
		new Date(firstDate).toDateString() === new Date(secondDate).toDateString()
	);
};

export {
	formatDiscussionDate,
	formatMessageDay,
	formatMessageTime,
	getDiscussionSubtitle,
	getDiscussionTitle,
	getMessagePreview,
	getOtherDiscussionMember,
	isSameMessageDay,
};
