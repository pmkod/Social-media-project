import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { activeSessionsQueryKey } from "./common/session.query-key.ts";

const useLogoutOtherSessions = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			httpClient
				.post("sessions/logout-others")
				.json<{ disabledCount: number }>(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: activeSessionsQueryKey });
		},
	});
};

export { useLogoutOtherSessions };
