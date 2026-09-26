import { Configurations } from "../configurations";
import { internalHttpClient } from "../http-clients/internal.http-client";
import { removeDuplicateStrings } from "../utils/array.utils";

type UserDto = {
	id: string;
	username: string;
	fullName?: string | null;
	lowQualityProfilePictureFile?: {
		filename: string;
	} | null;
	bestQualityProfilePictureFile?: {
		filename: string;
	} | null;
};

type FetchUsersBatchResponse = {
	users: UserDto[];
};

const userServiceHttpClient = internalHttpClient.extend({
	prefix: Configurations.server.userServiceUrl,
});

const userServiceClient = {
	async fetchActiveUsersBatch(
		userIds: string[],
	): Promise<FetchUsersBatchResponse> {
		const uniqueUserIds = removeDuplicateStrings(userIds);
		if (uniqueUserIds.length === 0) return { users: [] };

		return await userServiceHttpClient
			.post("internal/user/get-active-users-batch", {
				json: { userIds: uniqueUserIds },
			})
			.json<FetchUsersBatchResponse>();
	},

	async updateUnseenNotificationsCount(
		userId: string,
		operation: { delta: number } | { reset: true },
	): Promise<void> {
		await userServiceHttpClient.patch(
			`internal/user/update-unseen-notifications-count/${encodeURIComponent(userId)}`,
			{ json: operation },
		);
	},
};

export { userServiceClient };
