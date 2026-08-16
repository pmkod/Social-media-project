export type BookmarkCollection = {
	id: string;
	ownerId: string;
	name: string;
	description?: string | null;
	isPublic: boolean;
	bookmarksCount: number;
	createdAt: string;
	updatedAt: string;
};
