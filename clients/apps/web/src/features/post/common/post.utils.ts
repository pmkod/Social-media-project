/**
 * Formats a post creation date for display in the UI (feeds, cards, lists).
 * Returns relative time for recent posts ("À l'instant", "5 min", "2 h", "3 j")
 * or clean localized date for older posts ("16 août", "16 août 2025").
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
		return "À l'instant";
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} min`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} h`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `${diffInDays} j`;
	}

	// For older posts
	const isCurrentYear = date.getFullYear() === now.getFullYear();
	return date.toLocaleDateString("fr-FR", {
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

/**
 * Formats a full date and time for detailed view headers / meta (e.g. Post detail).
 */
export function formatPostFullDate(
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

	const timeStr = date.toLocaleTimeString("fr-FR", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const dateStr = date.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	return `${dateStr} à ${timeStr}`;
}
