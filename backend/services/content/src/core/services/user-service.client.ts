import { Configurations } from "../configurations";
import { uniqueValues } from "../functions/collection.functions";

type UserProfileFileDto = {
	id: string;
	name: string;
};

export type UserProfileDto = {
	id: string;
	username: string;
	fullName?: string | null;
	bio?: string | null;
	lowQualityProfilePictureFile?: UserProfileFileDto | null;
	bestQualityProfilePictureFile?: UserProfileFileDto | null;
	lowQualityCoverPictureFile?: UserProfileFileDto | null;
	bestQualityCoverPictureFile?: UserProfileFileDto | null;
	postCount?: number;
	followersCount?: number;
	followingCount?: number;
	createdAt?: string | null;
	isFollowedByAuthenticatedUser?: boolean;
	isBlockedByAuthenticatedUser?: boolean;
	hasBlockedAuthenticatedInUser?: boolean;
};

export type BlockRelationshipIdsDto = {
	blockedUserIds: string[];
	blockedByUserIds: string[];
};

export class UserServiceClient {
	private readonly baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = (baseUrl || Configurations.server.userServiceUrl).replace(
			/\/$/,
			"",
		);
	}

	private async requestBlockRelationships(
		userId: string,
		otherUserIds: string[],
	): Promise<BlockRelationshipIdsDto> {
		const response = await fetch(
			`${this.baseUrl}/internal/user/check-block-relationships`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId, otherUserIds }),
			},
		);
		if (!response.ok) {
			throw new Error(
				`User service responded with status ${response.status}`,
			);
		}

		const relationships =
			(await response.json()) as BlockRelationshipIdsDto;
		return {
			blockedUserIds: relationships.blockedUserIds ?? [],
			blockedByUserIds: relationships.blockedByUserIds ?? [],
		};
	}

	async fetchAuthorsBatch(
		userIds: string[],
		authenticatedUserId?: string,
	): Promise<Map<string, UserProfileDto>> {
		const uniqueIds = uniqueValues(
			userIds.filter((id): id is string =>
				Boolean(id && typeof id === "string"),
			),
		);

		const authorsMap = new Map<string, UserProfileDto>();
		if (uniqueIds.length === 0) {
			return authorsMap;
		}

		try {
			const [response, relationships] = await Promise.all([
				fetch(`${this.baseUrl}/internal/user/get-users-batch`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ userIds: uniqueIds }),
				}),
				authenticatedUserId
					? this.requestBlockRelationships(authenticatedUserId, uniqueIds)
					: Promise.resolve({
							blockedUserIds: [],
							blockedByUserIds: [],
						}),
			]);

			if (!response.ok) {
				console.error(
					`[UserServiceClient] Failed to fetch users batch, status: ${response.status}`,
				);
				return authorsMap;
			}

			const users = (await response.json()) as UserProfileDto[];
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
	}

	async fetchBlockRelationshipIds(
		userId: string,
	): Promise<BlockRelationshipIdsDto> {
		try {
			const response = await fetch(
				`${this.baseUrl}/internal/user/get-block-relationship-ids/${encodeURIComponent(userId)}`,
			);
			if (!response.ok) {
				return { blockedUserIds: [], blockedByUserIds: [] };
			}
			const data = (await response.json()) as BlockRelationshipIdsDto;
			return {
				blockedUserIds: data.blockedUserIds ?? [],
				blockedByUserIds: data.blockedByUserIds ?? [],
			};
		} catch (error) {
			console.error(
				"[UserServiceClient] Failed to fetch block relationship IDs:",
				error,
			);
			return { blockedUserIds: [], blockedByUserIds: [] };
		}
	}

	async hasBlockRelationship(userId: string, otherUserId: string) {
		if (userId === otherUserId) return false;
		const relationships = await this.fetchBlockRelationshipIds(userId);
		return (
			relationships.blockedUserIds.includes(otherUserId) ||
			relationships.blockedByUserIds.includes(otherUserId)
		);
	}

	async fetchFollowingIds(userId: string): Promise<string[]> {
		try {
			const response = await fetch(
				`${this.baseUrl}/internal/user/get-following-ids/${encodeURIComponent(userId)}`,
			);
			if (!response.ok) return [];
			const data = (await response.json()) as { userIds: string[] };
			return data.userIds ?? [];
		} catch (error) {
			console.error(
				"[UserServiceClient] Failed to fetch following IDs:",
				error,
			);
			return [];
		}
	}

	async adjustPostCount(userId: string, delta: -1 | 1): Promise<void> {
		try {
			const response = await fetch(
				`${this.baseUrl}/internal/user/update-post-count/${encodeURIComponent(userId)}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ delta }),
				},
			);
			if (!response.ok) {
				console.error(
					`[UserServiceClient] Failed to update post count, status: ${response.status}`,
				);
			}
		} catch (error) {
			console.error("[UserServiceClient] Failed to update post count:", error);
		}
	}
}

export const userServiceClient = new UserServiceClient();
