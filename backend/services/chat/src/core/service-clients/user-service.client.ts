import { Configurations } from "../configurations";
import { internalHttpClient } from "../http-clients/internal.http-client";
import { removeDuplicateStrings } from "../utils/array.utils";

type UserProfileFileDto = {
	filename: string;
};

type UserProfileDto = {
	id: string;
	username: string;
	fullName?: string | null;
	lowQualityProfilePictureFile?: UserProfileFileDto | null;
	bestQualityProfilePictureFile?: UserProfileFileDto | null;
	isBlockedByAuthenticatedUser?: boolean;
	hasBlockedAuthenticatedInUser?: boolean;
};

type FetchActiveUsersBatchResponse = {
	users: UserProfileDto[];
};

type FetchActiveUserResponse = {
	user: UserProfileDto | null;
};

type BlockRelationshipIdsDto = {
	blockedUserIds: string[];
	blockedByUserIds: string[];
};

const userServiceHttpClient = internalHttpClient.extend({
	prefix: Configurations.server.userServiceUrl,
});

const userServiceClient = {
	async fetchActiveUser(userId: string): Promise<FetchActiveUserResponse> {
		return await userServiceHttpClient
			.get(`internal/user/get-active-user/${encodeURIComponent(userId)}`)
			.json<FetchActiveUserResponse>();
	},

	async fetchActiveUsersBatch(
		userIds: string[],
	): Promise<FetchActiveUsersBatchResponse> {
		return await userServiceHttpClient
			.post("internal/user/get-active-users-batch", {
				json: { userIds },
			})
			.json<FetchActiveUsersBatchResponse>();
	},

	async fetchBlockRelationshipIds(
		userId: string,
	): Promise<BlockRelationshipIdsDto> {
		const relationships = await userServiceHttpClient
			.get(
				`internal/user/get-block-relationship-ids/${encodeURIComponent(userId)}`,
			)
			.json<BlockRelationshipIdsDto>();
		return {
			blockedUserIds: relationships.blockedUserIds ?? [],
			blockedByUserIds: relationships.blockedByUserIds ?? [],
		};
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
		const data = await userServiceHttpClient
			.get(`internal/user/get-following-ids/${encodeURIComponent(userId)}`)
			.json<{ userIds: string[] }>();
		return data.userIds ?? [];
	},

	async adjustPostCount(userId: string, delta: -1 | 1): Promise<void> {
		await userServiceHttpClient.patch(
			`internal/user/update-post-count/${encodeURIComponent(userId)}`,
			{ json: { delta } },
		);
	},

	async fetchActiveUsersBatchWithBlockRelationships(
		userIds: string[],
		authenticatedUserId: string,
	): Promise<Map<string, UserProfileDto>> {
		const uniqueUserIds = removeDuplicateStrings(userIds);
		if (uniqueUserIds.length === 0) return new Map();

		const [{ users }, relationships] = await Promise.all([
			userServiceHttpClient
				.post("internal/user/get-active-users-batch", {
					json: { userIds: uniqueUserIds },
				})
				.json<FetchActiveUsersBatchResponse>(),
			userServiceHttpClient
				.post("internal/user/check-block-relationships", {
					json: { userId: authenticatedUserId, otherUserIds: uniqueUserIds },
				})
				.json<BlockRelationshipIdsDto>(),
		]);
		const blockedUserIds = new Set(relationships.blockedUserIds);
		const blockedByUserIds = new Set(relationships.blockedByUserIds);

		return new Map(
			users.map((user) => [
				user.id,
				{
					...user,
					isBlockedByAuthenticatedUser: blockedUserIds.has(user.id),
					hasBlockedAuthenticatedInUser: blockedByUserIds.has(user.id),
				},
			]),
		);
	},
};

export { userServiceClient };
export type { UserProfileDto };
