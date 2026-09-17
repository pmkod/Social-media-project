import { getLocale } from "@/paraglide/runtime.js";

/**
 * Formats a post creation date for display in the UI (feeds, cards, lists).
 * Returns relative time for recent posts or a localized date for older posts.
 */
export function formatPostCreationDate(
	dateInput: string | Date | number | null | undefined,
): string {
	if (!dateInput) return "";

	const date =
		typeof dateInput === "string" || typeof dateInput === "number"
			? new Date(dateInput)
			: dateInput;

	if (Number.isNaN(date.getTime())) {
		return typeof dateInput === "string" ? dateInput : "";
	}

	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	const locale = getLocale();
	const relativeTimeFormatter = new Intl.RelativeTimeFormat(locale, {
		numeric: "auto",
		style: "narrow",
	});

	// Handling future dates or barely created items
	if (diffInSeconds < 60) {
		return relativeTimeFormatter.format(0, "second");
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return relativeTimeFormatter.format(-diffInMinutes, "minute");
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return relativeTimeFormatter.format(-diffInHours, "hour");
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return relativeTimeFormatter.format(-diffInDays, "day");
	}

	// For older posts
	const isCurrentYear = date.getFullYear() === now.getFullYear();
	return date.toLocaleDateString(locale, {
		day: "numeric",
		month: "short",
		year: isCurrentYear ? undefined : "numeric",
	});
}

/**
 * Formats a comment creation date for display in comment items.
 */
export function formatCommentCreationDate(
	dateInput: string | Date | number | null | undefined,
): string {
	return formatPostCreationDate(dateInput);
}
