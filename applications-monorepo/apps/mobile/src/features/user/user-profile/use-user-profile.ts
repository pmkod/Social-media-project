import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { userDetailsQueryKeys } from "../common/user-details-query-keys";
import type { User } from "../common/user";

export type UserProfileResponse = {
	user: User;
};

type UseUserProfileParams = {
	username: string;
};

export const useUserProfile = ({ username }: UseUserProfileParams) =>
	useQuery({
		queryKey: userDetailsQueryKeys.byUsername(username),
		queryFn: () =>
			httpClient
				.get(`user/get-user-by-username/${encodeURIComponent(username)}`)
				.json<UserProfileResponse>(),
		enabled: Boolean(username),
		retry: false,
	});
