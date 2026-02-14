import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";
import type { i18n } from "../configs/i18n";

export type LocaleType = (typeof i18n)["locales"][number];

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDistance(value: string | number | Date) {
	const distance = formatDistanceToNow(value, { addSuffix: true });

	const replacements: Record<string, string> = {
		minute: "min",
		minutes: "mins",
		hour: "hr",
		hours: "hrs",
		day: "day",
		days: "days",
		month: "month",
		months: "months",
		year: "year",
		years: "years",
	};

	if (distance === "less than a minute ago") {
		return "just now";
	}

	// Replace phrases based on the mapping
	return distance
		.replace(
			/less than a minute|minute|minutes|hour|hours|day|days|month|months|year|years/g,
			(match: string) => replacements[match],
		)
		.replace(/\b(over|almost|about)\b/g, "");
}

export function formatNumberToCompact(
	value: number,
	locales: LocaleType = "en",
) {
	return new Intl.NumberFormat(locales, {
		notation: "compact",
		compactDisplay: "short",
	}).format(value);
}

export function getInitials(fullName: string) {
	if (fullName.length === 0) return "";

	// Split the name by spaces
	const names = fullName.split(" ");
	// Extract the first letter of each name and convert it to uppercase
	const initials = names.map((name) => name.charAt(0).toUpperCase()).join("");

	return initials;
}
