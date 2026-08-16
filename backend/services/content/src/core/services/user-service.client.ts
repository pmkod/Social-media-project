import { Configurations } from "../configurations";

export type AuthorDto = {
	id: string;
	name: string;
	handle: string;
	avatar: string;
};

export type UserProfileDto = {
	id: string;
	username: string;
	fullName?: string | null;
	displayName?: string | null;
	avatarUrl?: string | null;
	bio?: string | null;
};


export class UserServiceClient {
	private readonly baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = (baseUrl || Configurations.server.userServiceUrl).replace(
			/\/$/,
			"",
		);
	}

	async fetchAuthorsBatch(userIds: string[]): Promise<Map<string, AuthorDto>> {
		const uniqueIds = Array.from(
			new Set(
				userIds.filter((id): id is string =>
					Boolean(id && typeof id === "string"),
				),
			),
		);

		const authorsMap = new Map<string, AuthorDto>();
		if (uniqueIds.length === 0) {
			return authorsMap;
		}

		try {
			const response = await fetch(`${this.baseUrl}/users/batch`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
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
				const author: AuthorDto = {
					id: user.id,
					name: user.displayName || user.fullName || user.username,
					handle: user.username,
					avatar: user.avatarUrl || "",
				};
				authorsMap.set(user.id, author);
			}
		} catch (error) {
			console.error(
				"[UserServiceClient] Error calling user-service batch:",
				error,
			);
		}

		return authorsMap;
	}
}

export const userServiceClient = new UserServiceClient();
