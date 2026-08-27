import type { User } from "@/features/user/common/user.ts";

type SearchHistoryCursor = {
	id: string;
	createdAt: string;
};

type SearchHistoryItem = {
	id: string;
	text: string | null;
	userId: string | null;
	createdAt: string;
	user: User | null;
};

type SearchHistoryResponse = {
	history: SearchHistoryItem[];
	pagination: {
		nextCursor: SearchHistoryCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

type CreateSearchHistoryInput =
	| { text: string; userId?: never }
	| { text?: never; userId: string };

export type {
	CreateSearchHistoryInput,
	SearchHistoryCursor,
	SearchHistoryItem,
	SearchHistoryResponse,
};
