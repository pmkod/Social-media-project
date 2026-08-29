import { HTTPException } from "hono/http-exception";
import { Configurations } from "../configurations";

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
		authenticatedUserId: string,
	): Promise<UserProfileDto[]> {
		const response = await fetch(`${this.baseUrl}/users/batch`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Authenticated-User-Id": authenticatedUserId,
			},
			body: JSON.stringify({ userIds }),
		});

		if (!response.ok) {
			throw new Error(`User service responded with status ${response.status}`);
		}

		return (await response.json()) as UserProfileDto[];
	}

	async fetchUsersBatch(
		userIds: string[],
		authenticatedUserId: string,
	): Promise<Map<string, UserProfileDto>> {
		const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
		const usersMap = new Map<string, UserProfileDto>();
		if (uniqueIds.length === 0) return usersMap;

		try {
			const users = await this.requestUsersBatch(
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
			const users = await this.requestUsersBatch(
				uniqueIds,
				authenticatedUserId,
			);
			return new Map(users.map((user) => [user.id, user]));
		} catch (error) {
			console.error("[UserServiceClient] Failed to validate chat users:", error);
			throw new HTTPException(503, {
				message: "User service is temporarily unavailable",
			});
		}
	}
}

export const userServiceClient = new UserServiceClient();
