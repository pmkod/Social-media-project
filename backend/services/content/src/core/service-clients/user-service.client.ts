import { Configurations } from "../configurations";
import { internalHttpClient } from "../http-clients/internal.http-client";
import { removeDuplicateStrings } from "../utils/array.utils";

type UserProfileFileDto = {
	filename: string;
};

type UserProfileDto = {
	id: string;
	username: string;
	fullName: string | null;
	lowQualityProfilePictureFile: UserProfileFileDto | null;
	bestQualityProfilePictureFile: UserProfileFileDto | null;
	isBlockedByAuthenticatedUser: boolean;
	hasBlockedAuthenticatedInUser: boolean;
};

type FetchUsersBatchResponse = {
	users: Array<
		Omit<
			UserProfileDto,
			"isBlockedByAuthenticatedUser" | "hasBlockedAuthenticatedInUser"
		>
	>;
};

type BlockRelationshipIdsDto = {
	blockedUserIds: string[];
	blockedByUserIds: string[];
};

const userServiceHttpClient = internalHttpClient.extend({
	prefix: Configurations.server.userServiceUrl,
});

const requestBlockRelationships = async (
	userId: string,
	otherUserIds: string[],
): Promise<BlockRelationshipIdsDto> =>
	await userServiceHttpClient
		.post("internal/user/check-block-relationships", {
			json: { userId, otherUserIds },
		})
		.json<BlockRelationshipIdsDto>();

const userServiceClient = {
	async fetchActiveAuthorsBatch(
		authorIds: string[],
		authenticatedUserId?: string,
	): Promise<Map<string, UserProfileDto>> {
		const uniqueAuthorIds = removeDuplicateStrings(authorIds);
		const authorsMap = new Map<string, UserProfileDto>();
		if (uniqueAuthorIds.length === 0) return authorsMap;

		try {
			const [{ users }, relationships] = await Promise.all([
				userServiceHttpClient
					.post("internal/user/get-active-users-batch", {
						json: { userIds: uniqueAuthorIds },
					})
					.json<FetchUsersBatchResponse>(),
				authenticatedUserId
					? requestBlockRelationships(authenticatedUserId, uniqueAuthorIds)
					: Promise.resolve({
							blockedUserIds: [],
							blockedByUserIds: [],
						}),
			]);
			const blockedUserIds = new Set(relationships.blockedUserIds);
			const blockedByUserIds = new Set(relationships.blockedByUserIds);

			for (const user of users) {
				authorsMap.set(user.id, {
					...user,
					isBlockedByAuthenticatedUser: blockedUserIds.has(user.id),
					hasBlockedAuthenticatedInUser: blockedByUserIds.has(user.id),
				});
			}
		} catch (error) {
			console.error(
				"[UserServiceClient] Error calling user-service batch:",
				error,
			);
		}

		return authorsMap;
	},

	async fetchBlockRelationshipIds(
		userId: string,
	): Promise<BlockRelationshipIdsDto> {
		try {
			const relationships = await userServiceHttpClient
				.get(
					`internal/user/get-block-relationship-ids/${encodeURIComponent(userId)}`,
				)
				.json<BlockRelationshipIdsDto>();
			return {
				blockedUserIds: relationships.blockedUserIds ?? [],
				blockedByUserIds: relationships.blockedByUserIds ?? [],
			};
		} catch (error) {
			console.error(
				"[UserServiceClient] Failed to fetch block relationship IDs:",
				error,
			);
			return { blockedUserIds: [], blockedByUserIds: [] };
		}
	},

	async hasBlockRelationship(userId: string, otherUserId: string) {
		if (userId === otherUserId) return false;
		const relationships = await this.fetchBlockRelationshipIds(userId);
		return (
			relationships.blockedUserIds.includes(otherUserId) ||
			relationships.blockedByUserIds.includes(otherUserId)
		);
	},

	async fetchFollowingIds(userId: string): Promise<string[]> {
		try {
			const data = await userServiceHttpClient
				.get(`internal/user/get-following-ids/${encodeURIComponent(userId)}`)
				.json<{ userIds: string[] }>();
			return data.userIds ?? [];
		} catch (error) {
			console.error(
				"[UserServiceClient] Failed to fetch following IDs:",
				error,
			);
			return [];
		}
	},

	async adjustPostCount(userId: string, delta: -1 | 1): Promise<void> {
		try {
			await userServiceHttpClient.patch(
				`internal/user/update-post-count/${encodeURIComponent(userId)}`,
				{ json: { delta } },
			);
		} catch (error) {
			console.error("[UserServiceClient] Failed to update post count:", error);
		}
	},
};

export { userServiceClient };
