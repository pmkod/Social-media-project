import { Configurations } from "../configurations";
import { internalHttpClient } from "../http-clients/internal.http-client";

type UserProfileFileDto = {
	filename: string;
};

type FetchActiveUsersBatchResponse = {
	users: {
		id: string;
		username: string;
		fullName?: string | null;
		lowQualityProfilePictureFile?: UserProfileFileDto | null;
		bestQualityProfilePictureFile?: UserProfileFileDto | null;
	}[];
};

type FetchActiveUserResponse = {
	user: {
		id: string;
		username: string;
		fullName?: string | null;
		lowQualityProfilePictureFile?: UserProfileFileDto | null;
		bestQualityProfilePictureFile?: UserProfileFileDto | null;
	} | null;
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
				json: { userIds: userIds },
			})
			.json<FetchActiveUsersBatchResponse>();
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
