import type { User } from "@/features/user/common/user.ts";

type SearchHistoryItem = {
	id: string;
	text: string | null;
	userId: string | null;
	createdAt: string;
	user: User | null;
};

export type { SearchHistoryItem };
