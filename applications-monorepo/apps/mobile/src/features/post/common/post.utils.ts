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

	if (diffInSeconds < 60) {
		return "just now";
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes}m`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours}h`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `${diffInDays}d`;
	}

	const isCurrentYear = date.getFullYear() === now.getFullYear();
	return date.toLocaleDateString("en-US", {
		day: "numeric",
		month: "short",
		year: isCurrentYear ? undefined : "numeric",
	});
}

export function formatCommentCreationDate(
	dateInput: string | Date | number | null | undefined,
): string {
	return formatPostCreationDate(dateInput);
}
