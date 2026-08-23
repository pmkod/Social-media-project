export type BookmarkCollection = {
	id: string;
	ownerId: string;
	name: string;
	description?: string | null;
	bookmarksCount: number;
	isPostInCollection?: boolean;
	createdAt: string;
	updatedAt: string;
};

export type BookmarkCollectionsCursor = {
	id: string;
	createdAt: string;
};

export type BookmarkCollectionsResponse = {
	bookmarkCollections: BookmarkCollection[];
	pagination: {
		nextCursor: BookmarkCollectionsCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

export type BookmarkCollectionResponse = {
	bookmarkCollection: BookmarkCollection;
};
