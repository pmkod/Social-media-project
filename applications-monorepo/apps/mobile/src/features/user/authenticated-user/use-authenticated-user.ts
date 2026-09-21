import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { getSessionCredentials } from "@/core/utils/session.utils";
import { authenticatedUserQueryKey } from "./authenticated-user.query-key";
import type { UseAuthenticatedUserQueryData } from "./types/use-authenticated-user-query-data";

export const useAuthenticatedUser = () => {
	return useQuery({
		queryKey: authenticatedUserQueryKey,
		queryFn: async () => {
			const sessionCredentials = await getSessionCredentials();
			if (!sessionCredentials) {
				throw new Error("No session credentials found");
			}
			return httpClient.get<UseAuthenticatedUserQueryData>("user/get-me").json();
		},
		retry: false,
	});
};

export { authenticatedUserQueryKey };
