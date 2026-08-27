import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { notificationQueryKeys } from "./notification.query-keys.ts";
import type {
	NotificationsCursor,
	NotificationsResponse,
} from "./notification.ts";

const useNotifications = (limit = 25) =>
	useInfiniteQuery({
		queryKey: notificationQueryKeys.all,
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: limit.toString() });
			if (pageParam) {
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
				searchParams.set("cursorId", pageParam.id);
			}
			return httpClient
				.get("notifications", { searchParams })
				.json<NotificationsResponse>();
		},
		initialPageParam: null as NotificationsCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
	});

export { useNotifications };
