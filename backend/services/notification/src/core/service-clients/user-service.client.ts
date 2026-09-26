import { Configurations } from "../configurations";
import { internalHttpClient } from "../http-clients/internal.http-client";
import { removeDuplicateStrings } from "../utils/array.utils";

type User = {
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
	users: User[];
};

const userServiceHttpClient = internalHttpClient.extend({
	prefix: Configurations.server.userServiceUrl,
});

const userServiceClient = {
	async fetchUsersBatch(userIds: string[]): Promise<FetchUsersBatchResponse> {
		const uniqueIds = removeDuplicateStrings(userIds);
		if (uniqueIds.length === 0) return { users: [] };

		return await userServiceHttpClient
			.post("internal/user/get-users-batch", {
				json: { userIds: uniqueIds },
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
