/**
 * Formats a post creation date for display in the UI (feeds, cards, lists).
 * Returns relative time for recent posts ("Just now", "5 min", "2 hr", "3 d")
 * or a clean localized date for older posts ("Aug 16", "Aug 16, 2025").
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

	// Handling future dates or barely created items
	if (diffInSeconds < 60) {
		return "Just now";
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} min`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} hr`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `${diffInDays} d`;
	}

	// For older posts
	const isCurrentYear = date.getFullYear() === now.getFullYear();
	return date.toLocaleDateString("en-US", {
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
