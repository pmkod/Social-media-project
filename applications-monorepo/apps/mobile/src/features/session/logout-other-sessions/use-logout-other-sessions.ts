import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { activeSessionsQueryKey } from "../common/session.query-key";
import type { Session } from "../common/session";

export const useLogoutOtherSessions = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			httpClient
				.post("session/logout-other-sessions")
				.json<{ disabledCount: number }>(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: activeSessionsQueryKey.build(),
			});
		},
	});
};
