import { Configurations } from "../configurations";

export type UserProfileDto = {
	id: string;
	username: string;
	fullName?: string | null;
	displayName?: string | null;
	bio?: string | null;
	avatarUrl?: string | null;
	coverUrl?: string | null;
	location?: string | null;
	website?: string | null;
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

	async fetchAuthorsBatch(
		userIds: string[],
		authenticatedUserId?: string,
	): Promise<Map<string, UserProfileDto>> {
		const uniqueIds = Array.from(
			new Set(
				userIds.filter((id): id is string =>
					Boolean(id && typeof id === "string"),
				),
			),
		);

		const authorsMap = new Map<string, UserProfileDto>();
		if (uniqueIds.length === 0) {
			return authorsMap;
		}

		try {
			const response = await fetch(`${this.baseUrl}/users/batch`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(authenticatedUserId
						? { "X-Authenticated-User-Id": authenticatedUserId }
						: {}),
				},
				body: JSON.stringify({ userIds: uniqueIds }),
			});

			if (!response.ok) {
				console.error(
					`[UserServiceClient] Failed to fetch users batch, status: ${response.status}`,
				);
				return authorsMap;
			}

			const users = (await response.json()) as UserProfileDto[];
			for (const user of users) {
				authorsMap.set(user.id, user);
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
				`${this.baseUrl}/internal/users/${encodeURIComponent(userId)}/block-relationship-ids`,
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
				`${this.baseUrl}/internal/users/${encodeURIComponent(userId)}/following-ids`,
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
				`${this.baseUrl}/internal/users/${encodeURIComponent(userId)}/post-count`,
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
