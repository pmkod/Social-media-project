import { Configurations } from "../configurations";
import { HttpStatus } from "../constants/http-status";
import { Exception } from "../exceptions/exception";
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

type FetchUsersBatchResponse = {
	users: UserProfileDto[];
};

type BlockRelationshipsResponse = {
	blockedUserIds: string[];
	blockedByUserIds: string[];
};

const userServiceHttpClient = internalHttpClient.extend({
	prefix: Configurations.server.userServiceUrl,
});

const requestActiveUsersBatch = async (
	userIds: string[],
): Promise<FetchUsersBatchResponse> =>
	await userServiceHttpClient
		.post("internal/user/get-active-users-batch", {
			json: { userIds },
		})
		.json<FetchUsersBatchResponse>();

const requestBlockRelationships = async (
	userId: string,
	otherUserIds: string[],
): Promise<BlockRelationshipsResponse> =>
	await userServiceHttpClient
		.post("internal/user/check-block-relationships", {
			json: { userId, otherUserIds },
		})
		.json<BlockRelationshipsResponse>();

const requestActiveUsersWithBlockRelationships = async (
	userIds: string[],
	authenticatedUserId: string,
): Promise<UserProfileDto[]> => {
	const [{ users }, relationships] = await Promise.all([
		requestActiveUsersBatch(userIds),
		requestBlockRelationships(authenticatedUserId, userIds),
	]);
	const blockedUserIds = new Set(relationships.blockedUserIds);
	const blockedByUserIds = new Set(relationships.blockedByUserIds);

	return users.map((user) => ({
		...user,
		isBlockedByAuthenticatedUser: blockedUserIds.has(user.id),
		hasBlockedAuthenticatedInUser: blockedByUserIds.has(user.id),
	}));
};

const userServiceClient = {
	async fetchActiveUsersBatch(
		userIds: string[],
		authenticatedUserId: string,
	): Promise<Map<string, UserProfileDto>> {
		const uniqueUserIds = removeDuplicateStrings(userIds);
		const usersMap = new Map<string, UserProfileDto>();
		if (uniqueUserIds.length === 0) return usersMap;

		try {
			const users = await requestActiveUsersWithBlockRelationships(
				uniqueUserIds,
				authenticatedUserId,
			);
			for (const user of users) {
				usersMap.set(user.id, user);
			}
		} catch (error) {
			console.error(
				"[UserServiceClient] Failed to fetch chat users:",
				error,
			);
		}

		return usersMap;
	},

	async fetchActiveUsersBatchOrThrow(
		userIds: string[],
		authenticatedUserId: string,
	): Promise<Map<string, UserProfileDto>> {
		const uniqueUserIds = removeDuplicateStrings(userIds);
		if (uniqueUserIds.length === 0) return new Map();

		try {
			const users = await requestActiveUsersWithBlockRelationships(
				uniqueUserIds,
				authenticatedUserId,
			);
			return new Map(users.map((user) => [user.id, user]));
		} catch (error) {
			console.error(
				"[UserServiceClient] Failed to validate chat users:",
				error,
			);
			throw new Exception({
				message: "User service is temporarily unavailable",
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}
	},
};

export { userServiceClient };
export type { UserProfileDto };
