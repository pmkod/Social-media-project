import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { getAccessToken } from "@/core/utils/token.utils.ts";
import type { UseAuthenticatedUserQueryData } from "./types/use-authenticated-user-query-data.ts";
import { authenticatedUserQueryKey } from "./authenticated-user.query-key.ts";

const useAuthenticatedUser = () => {
	return useQuery({
		queryKey: authenticatedUserQueryKey,
		queryFn: () => {
			const accessToken = getAccessToken();
			if (!accessToken) {
				throw new Error();
			}
			return httpClient.get("users/me").json<UseAuthenticatedUserQueryData>();
		},
		retry: false,
	});
};

export { useAuthenticatedUser, authenticatedUserQueryKey };
