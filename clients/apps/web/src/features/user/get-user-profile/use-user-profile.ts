import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "@/features/user/common/user.ts";
import { userDetailsQueryKeys } from "./user-details-query-keys.ts";

const useUserProfile = (username: string) =>
	useQuery({
		queryKey: userDetailsQueryKeys.byUsername(username),
		queryFn: () =>
			httpClient
				.get(`users/by-username/${encodeURIComponent(username)}`)
				.json<User>(),
		enabled: Boolean(username),
		retry: false,
	});

export { useUserProfile };
