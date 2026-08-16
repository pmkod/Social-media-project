import { prisma } from "@/core/databases";

const getBookmarkCollections = async ({
	ownerId,
	includePrivate,
}: {
	ownerId: string;
	includePrivate: boolean;
}) => {
	const collections = await prisma.bookmarkCollection.findMany({
		where: {
			ownerId,
			...(includePrivate ? {} : { isPublic: true }),
		},
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			ownerId: true,
			name: true,
			description: true,
			isPublic: true,
			createdAt: true,
			updatedAt: true,
			_count: { select: { items: true } },
		},
	});

	return collections.map(({ _count, ...collection }) => ({
		...collection,
		bookmarksCount: _count.items,
	}));
};

export { getBookmarkCollections };
