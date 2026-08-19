import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { userDetailsQueryKeys } from "./user-details-query-keys.ts";
import type { UserProfileResponse } from "./user-profile-response.ts";

const useUserProfile = (username: string) =>
	useQuery({
		queryKey: userDetailsQueryKeys.byUsername(username),
		queryFn: () =>
			httpClient
				.get(`users/by-username/${encodeURIComponent(username)}`)
				.json<UserProfileResponse>(),
		enabled: Boolean(username),
		retry: false,
	});

export { useUserProfile };
