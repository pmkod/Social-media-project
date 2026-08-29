const uniqueOtherUserIds = (
	userIds: string[],
	authenticatedUserId: string,
): string[] =>
	Array.from(
		new Set(userIds.filter((userId) => userId !== authenticatedUserId)),
	);

export { uniqueOtherUserIds };
