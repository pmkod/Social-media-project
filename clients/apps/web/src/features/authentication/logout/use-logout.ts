import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { deleteSessionCredentials } from "@/core/utils/session.utils.ts";

const useLogout = () => {
	return useMutation({
		mutationFn: async () => {
			try {
				await httpClient.post("authentication/logout");
			} finally {
				deleteSessionCredentials();
			}
		},
	});
};

export { useLogout };
