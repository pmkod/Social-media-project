import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { getAccessToken } from "@/core/utils/token.utils.ts";
import type { UseLoggedInUserQueryData } from "./types/use-logged-in-user-query-data.ts";

const loggedInUserQueryKey = ["loggedInUser"];

const useLoggedInUser = () => {
	return useQuery({
		queryKey: loggedInUserQueryKey,
		queryFn: () => {
			const accessToken = getAccessToken();
			if (!accessToken) {
				throw new Error();
			}
			return httpClient.get("users/me").json<UseLoggedInUserQueryData>();
		},
		retry: false,
	});
};

export { useLoggedInUser, loggedInUserQueryKey };
