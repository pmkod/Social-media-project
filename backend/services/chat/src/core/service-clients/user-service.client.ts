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

type FetchActiveUsersBatchResponse = {
	users: UserProfileDto[];
};

type FetchActiveUserResponse = {
	user:
		| Omit<
				UserProfileDto,
				"isBlockedByAuthenticatedUser" | "hasBlockedAuthenticatedInUser"
		  >
		| null;
};

type BlockRelationshipIdsDto = {
	blockedUserIds: string[];
	blockedByUserIds: string[];
};

const userServiceHttpClient = internalHttpClient.extend({
	prefix: Configurations.server.userServiceUrl,
});

const requestActiveUsersBatch = async (
	userIds: string[],
): Promise<FetchActiveUsersBatchResponse> =>
	await userServiceHttpClient
		.post("internal/user/get-active-users-batch", {
			json: { userIds },
		})
		.json<FetchActiveUsersBatchResponse>();

const requestBlockRelationships = async (
	userId: string,
	otherUserIds: string[],
): Promise<BlockRelationshipIdsDto> =>
	await userServiceHttpClient
		.post("internal/user/check-block-relationships", {
			json: { userId, otherUserIds },
		})
		.json<BlockRelationshipIdsDto>();

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
	async fetchActiveUser(userId: string): Promise<FetchActiveUserResponse> {
		return await userServiceHttpClient
			.get(`internal/user/get-active-user/${encodeURIComponent(userId)}`)
			.json<FetchActiveUserResponse>();
	},

	async fetchActiveUsersBatch(
		userIds: string[],
	): Promise<FetchActiveUsersBatchResponse> {
		return await requestActiveUsersBatch(userIds);
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

	async fetchActiveUsersBatchWithBlockRelationships(
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

	async fetchActiveUsersBatchWithBlockRelationshipsOrThrow(
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
