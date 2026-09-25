import { Configurations } from "../configurations";
import { HttpStatus } from "../constants/http-status";
import { Exception } from "../exceptions/exception";

type UserProfileFileDto = {
	id: string;
	filename: string;
};

export type UserProfileDto = {
	id: string;
	username: string;
	fullName?: string | null;
	lowQualityProfilePictureFile?: UserProfileFileDto | null;
	bestQualityProfilePictureFile?: UserProfileFileDto | null;
	isBlockedByAuthenticatedUser?: boolean;
	hasBlockedAuthenticatedInUser?: boolean;
};

type BlockRelationshipsDto = {
	blockedUserIds: string[];
	blockedByUserIds: string[];
};

class UserServiceClient {
	private readonly baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = (baseUrl || Configurations.server.userServiceUrl).replace(
			/\/$/,
			"",
		);
	}

	private async requestUsersBatch(
		userIds: string[],
	): Promise<UserProfileDto[]> {
		const response = await fetch(
			`${this.baseUrl}/internal/user/get-users-batch`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userIds }),
			},
		);

		if (!response.ok) {
			throw new Exception({
				message: `User service responded with status ${response.status}`,
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}

		return (await response.json()) as UserProfileDto[];
	}

	private async requestBlockRelationships(
		userId: string,
		otherUserIds: string[],
	): Promise<BlockRelationshipsDto> {
		const response = await fetch(
			`${this.baseUrl}/internal/user/check-block-relationships`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId, otherUserIds }),
			},
		);

		if (!response.ok) {
			throw new Exception({
				message: `User service responded with status ${response.status}`,
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}

		return (await response.json()) as BlockRelationshipsDto;
	}

	private async requestUsersWithBlockRelationships(
		userIds: string[],
		authenticatedUserId: string,
	): Promise<UserProfileDto[]> {
		const [users, relationships] = await Promise.all([
			this.requestUsersBatch(userIds),
			this.requestBlockRelationships(authenticatedUserId, userIds),
		]);
		const blockedUserIds = new Set(relationships.blockedUserIds);
		const blockedByUserIds = new Set(relationships.blockedByUserIds);

		return users.map((user) => ({
			...user,
			isBlockedByAuthenticatedUser: blockedUserIds.has(user.id),
			hasBlockedAuthenticatedInUser: blockedByUserIds.has(user.id),
		}));
	}

	async fetchUsersBatch(
		userIds: string[],
		authenticatedUserId: string,
	): Promise<Map<string, UserProfileDto>> {
		const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
		const usersMap = new Map<string, UserProfileDto>();
		if (uniqueIds.length === 0) return usersMap;

		try {
			const users = await this.requestUsersWithBlockRelationships(
				uniqueIds,
				authenticatedUserId,
			);
			for (const user of users) usersMap.set(user.id, user);
		} catch (error) {
			console.error("[UserServiceClient] Failed to fetch chat users:", error);
		}

		return usersMap;
	}

	async fetchUsersBatchOrThrow(
		userIds: string[],
		authenticatedUserId: string,
	): Promise<Map<string, UserProfileDto>> {
		const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
		if (uniqueIds.length === 0) return new Map();

		try {
			const users = await this.requestUsersWithBlockRelationships(
				uniqueIds,
				authenticatedUserId,
			);
			return new Map(users.map((user) => [user.id, user]));
		} catch (error) {
			console.error("[UserServiceClient] Failed to validate chat users:", error);
			throw new Exception({
				message: "User service is temporarily unavailable",
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}
	}
}

export const userServiceClient = new UserServiceClient();
