import type { User } from "@/features/user/common/user";

export type SearchHistoryItem = {
	id: string;
	text: string | null;
	searchedUserId: string | null;
	createdAt: string;
	searchedUser: User | null;
};
