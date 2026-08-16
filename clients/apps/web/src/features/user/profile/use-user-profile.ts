import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { User } from "../common/user.ts";
import { userProfileQueryKeys } from "./user-profile.query-keys.ts";

const useUserProfile = (username: string) =>
	useQuery({
		queryKey: userProfileQueryKeys.byUsername(username),
		queryFn: () =>
			httpClient
				.get(`users/by-username/${encodeURIComponent(username)}`)
				.json<User>(),
		enabled: Boolean(username),
		retry: false,
	});

export { useUserProfile };
