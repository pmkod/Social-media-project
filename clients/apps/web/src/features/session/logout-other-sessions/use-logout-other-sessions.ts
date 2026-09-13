import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { getSessionId } from "@/core/utils/session.utils.ts";
import { activeSessionsQueryKey } from "../common/session.query-key.ts";
import type { Session } from "../common/session.ts";

const useLogoutOtherSessions = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			httpClient
				.post("sessions/logout-others")
				.json<{ disabledCount: number }>(),
		onSuccess: () => {
			const currentSessionId = getSessionId();
			queryClient.setQueryData<Session[]>(activeSessionsQueryKey, (sessions) =>
				sessions?.filter((session) => session.id === currentSessionId),
			);
		},
	});
};

export { useLogoutOtherSessions };
