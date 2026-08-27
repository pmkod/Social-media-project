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
};

class UserServiceClient {
	private readonly baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = (baseUrl || Configurations.server.userServiceUrl).replace(
			/\/$/,
			"",
		);
	}

	async fetchUsersBatch(
		userIds: string[],
		authenticatedUserId: string,
	): Promise<Map<string, UserProfileDto>> {
		const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
		const usersMap = new Map<string, UserProfileDto>();
		if (uniqueIds.length === 0) return usersMap;

		try {
			const response = await fetch(`${this.baseUrl}/users/batch`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Authenticated-User-Id": authenticatedUserId,
				},
				body: JSON.stringify({ userIds: uniqueIds }),
			});
			if (!response.ok) {
				console.error(
					`[UserServiceClient] Failed to fetch notification actors, status: ${response.status}`,
				);
				return usersMap;
			}

			const users = (await response.json()) as UserProfileDto[];
			for (const user of users) usersMap.set(user.id, user);
		} catch (error) {
			console.error(
				"[UserServiceClient] Failed to fetch notification actors:",
				error,
			);
		}

		return usersMap;
	}

	async updateUnseenNotificationsCount(
		userId: string,
		operation: { delta: number } | { reset: true },
	): Promise<void> {
		try {
			const response = await fetch(
				`${this.baseUrl}/internal/users/${encodeURIComponent(userId)}/unseen-notifications-count`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(operation),
				},
			);
			if (!response.ok) {
				console.error(
					`[UserServiceClient] Failed to update unseen notifications count, status: ${response.status}`,
				);
			}
		} catch (error) {
			console.error(
				"[UserServiceClient] Failed to update unseen notifications count:",
				error,
			);
		}
	}
}

export const userServiceClient = new UserServiceClient();
