import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/services/http.client";
import { deleteAccessAndRefreshToken } from "@/core/utils/authorization.utils";
import { userQueryKeys } from "@/features/user/user.query-keys";

const useLogout = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			await httpClient.post("authentication/logout");
			deleteAccessAndRefreshToken();
			queryClient.removeQueries({
				queryKey: userQueryKeys.loggedInUser.queryKey,
			});
		},
	});
};

export { useLogout };
