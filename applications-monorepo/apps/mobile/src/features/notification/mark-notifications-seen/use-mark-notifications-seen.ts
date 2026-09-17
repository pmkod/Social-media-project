import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { authenticatedUserQueryKey } from "@/features/user/authenticated-user/authenticated-user.query-key";
import type { UseAuthenticatedUserQueryData } from "@/features/user/authenticated-user/types/use-authenticated-user-query-data";
import type { NotificationsResponse } from "../common/notification";
import { notificationListQueryKeys } from "../list/notification-list.query-keys";

export const useMarkNotificationsSeen = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			httpClient.patch("notifications/seen").json<{ updatedCount: number }>(),
		onSuccess: () => {
			queryClient.setQueryData<InfiniteData<NotificationsResponse>>(
				notificationListQueryKeys.all,
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
