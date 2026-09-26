import { Configurations } from "../configurations";
import { internalHttpClient } from "../http-clients/internal.http-client";

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
		return await userServiceHttpClient
			.get(
				`internal/user/get-block-relationship-ids/${encodeURIComponent(userId)}`,
			)
			.json<BlockRelationshipIdsDto>();
	},

	async checkBlockRelationships(
		userId: string,
		otherUserIds: string[],
	): Promise<BlockRelationshipIdsDto> {
		return await userServiceHttpClient
			.post("internal/user/check-block-relationships", {
				json: { userId, otherUserIds },
			})
			.json<BlockRelationshipIdsDto>();
	},

	async fetchFollowingIds(userId: string): Promise<string[]> {
		const data = await userServiceHttpClient
			.get(`internal/user/get-following-ids/${encodeURIComponent(userId)}`)
			.json<{ userIds: string[] }>();
		return data.userIds ?? [];
	},

	async updatePostCount({
		userId,
		delta,
	}: {
		userId: string;
		delta: -1 | 1;
	}): Promise<void> {
		await userServiceHttpClient.patch(
			`internal/user/update-post-count/${encodeURIComponent(userId)}`,
			{ json: { delta } },
		);
	},
};

export { userServiceClient };
export type { UserProfileDto };
