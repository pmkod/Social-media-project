import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { UseAuthenticatedUserQueryData } from "@/features/user/authenticated-user/types/use-authenticated-user-query-data.ts";
import { authenticatedUserQueryKey } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { notificationQueryKeys } from "./notification.query-keys.ts";
import type { NotificationsResponse } from "./notification.ts";

const useMarkNotificationsSeen = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			httpClient.patch("notifications/seen").json<{ updatedCount: number }>(),
		onSuccess: () => {
			queryClient.setQueryData<InfiniteData<NotificationsResponse>>(
				notificationQueryKeys.all,
				(oldData) =>
					oldData
						? {
								...oldData,
								pages: oldData.pages.map((page) => ({
									...page,
									notifications: page.notifications.map((notification) => ({
										...notification,
										isSeen: true,
									})),
								})),
							}
						: oldData,
			);
			queryClient.setQueryData<UseAuthenticatedUserQueryData>(
				authenticatedUserQueryKey,
				(oldData) =>
					oldData
						? {
								...oldData,
								user: { ...oldData.user, unseenNotificationsCount: 0 },
							}
						: oldData,
			);
		},
	});
};

export { useMarkNotificationsSeen };
