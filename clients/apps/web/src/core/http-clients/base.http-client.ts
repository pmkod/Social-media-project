import ky, { isHTTPError } from "ky";
import { ApiConfig } from "@/core/configs/api.config.ts";
import { getExceptionMessage } from "@/core/exceptions/translate-exception-code.ts";

const baseHttpClient = ky.create({
	baseUrl: ApiConfig.baseUrl,
	retry: { limit: 1 },
	hooks: {
		beforeError: [
			({ request, options, error }) => {
				if (isHTTPError(error)) {
					error.message = getExceptionMessage(error);
				}

				console.log(`Request to ${request.url} failed`, options.context);

				return error;
			},
		],
	},
});

export { baseHttpClient };
