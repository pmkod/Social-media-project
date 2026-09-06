import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { activeSessionsQueryKey } from "./common/session.query-key.ts";
import type { Session } from "./common/session.ts";

const useDisableSession = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (sessionId: string) =>
			httpClient
				.patch(`sessions/${sessionId}/disable`)
				.json<{ session: Session }>(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: activeSessionsQueryKey });
		},
	});
};

export { useDisableSession };
