import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { getSessionCredentials } from "@/core/utils/session.utils.ts";
import { authenticatedUserQueryKey } from "./authenticated-user.query-key.ts";
import type { UseAuthenticatedUserQueryData } from "./types/use-authenticated-user-query-data.ts";

const useAuthenticatedUser = () => {
	return useQuery({
		queryKey: authenticatedUserQueryKey,
		queryFn: () => {
			const sessionCredentials = getSessionCredentials();
			if (!sessionCredentials) {
				throw new Error();
			}
			return httpClient.get("users/me").json<UseAuthenticatedUserQueryData>();
		},
		retry: false,
	});
};

export { authenticatedUserQueryKey, useAuthenticatedUser };
