import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { deleteSessionCredentials } from "@/core/utils/session.utils";
import { authenticatedUserQueryKey } from "@/features/user/authenticated-user/authenticated-user.query-key";

export const useLogout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			try {
				await httpClient.post("authentication/logout").json();
			} catch {
				// Ignore backend error during logout so credentials are still purged locally
			} finally {
				await deleteSessionCredentials();
				queryClient.removeQueries({ queryKey: authenticatedUserQueryKey });
			}
		},
	});
};
