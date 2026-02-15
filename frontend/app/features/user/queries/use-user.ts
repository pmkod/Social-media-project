import { httpClient } from "@/core/services/http.client";
import { useQuery } from "@tanstack/react-query";
import type { User } from "../types/user";
import { userQueryKeys } from "../user.query-keys";

type UseUserQueryData = {
	user: User;
};

type UseUserQueryParams = {
	username: string;
};

const useUser = ({ username }: UseUserQueryParams) => {
	return useQuery({
		queryKey: userQueryKeys.getUser(username).queryKey,
		queryFn: () => {
			return httpClient.get(`users/${username}`).json<UseUserQueryData>();
		},
		enabled: username !== undefined && username !== "",
	});
};

export { useUser };
