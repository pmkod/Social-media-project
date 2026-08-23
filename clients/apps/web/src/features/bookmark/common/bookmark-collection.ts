export type BookmarkCollection = {
	id: string;
	ownerId: string;
	name: string;
	description?: string | null;
	bookmarksCount: number;
	createdAt: string;
	updatedAt: string;
};
