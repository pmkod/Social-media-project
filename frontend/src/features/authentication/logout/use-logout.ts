import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import {
	deleteAccessAndRefreshToken,
	getRefreshToken,
} from "@/core/utils/token.utils.ts";

const useLogout = () => {
	return useMutation({
		mutationFn: async () => {
			const refreshToken = getRefreshToken();
			await httpClient.post("authentication/logout", {
				json: {
					refreshToken,
				},
			});
			deleteAccessAndRefreshToken();
		},
	});
};

export { useLogout };
