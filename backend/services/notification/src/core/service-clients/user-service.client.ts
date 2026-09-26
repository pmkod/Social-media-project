import { Configurations } from "../configurations";
import { internalHttpClient } from "../http-clients/internal.http-client";

type FetchActiveUsersBatchResponse = {
	users: {
		id: string;
		username: string;
		fullName?: string | null;
		lowQualityProfilePictureFile?: {
			filename: string;
		} | null;
		bestQualityProfilePictureFile?: {
			filename: string;
		} | null;
	}[];
};

const userServiceHttpClient = internalHttpClient.extend({
	prefix: Configurations.server.userServiceUrl,
});

const userServiceClient = {
	async fetchActiveUsersBatch(
		userIds: string[],
	): Promise<FetchActiveUsersBatchResponse> {
		return await userServiceHttpClient
			.post("internal/user/get-active-users-batch", {
				json: { userIds: userIds },
			})
			.json<FetchActiveUsersBatchResponse>();
	},

	async updateUnseenNotificationsCount(
		{ userId, delta }: { userId: string; delta: number },
	): Promise<void> {
		await userServiceHttpClient.patch(
			`internal/user/update-unseen-notifications-count/${encodeURIComponent(userId)}`,
			{ json: { delta } },
		);
	},

	async resetUnseenNotificationCount(userId: string): Promise<void> {
		await userServiceHttpClient.patch(
			`internal/user/reset-unseen-notification-count/${encodeURIComponent(userId)}`,
		);
	},
};

export { userServiceClient };
