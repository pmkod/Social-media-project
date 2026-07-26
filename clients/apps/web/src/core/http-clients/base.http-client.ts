import ky, { isHTTPError } from "ky";
import { ApiConfig } from "@/core/configs/api.config.ts";

const baseHttpClient = ky.create({
	baseUrl: ApiConfig.baseUrl,
	retry: { limit: 1 },
	hooks: {
		beforeError: [
			({ request, options, error }) => {
				if (isHTTPError(error)) {
					if (
						typeof error.data === "object" &&
						error.data !== null &&
						"message" in error.data
					) {
						error.message = (error.data.message as string) || "";
					}
				}

				console.log(`Request to ${request.url} failed`, options.context);

				return error;
			},
		],
	},
});

export { baseHttpClient };
