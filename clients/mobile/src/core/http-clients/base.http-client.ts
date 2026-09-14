import ky, { isHTTPError } from "ky";

import { API_BASE_URL } from "@/core/config/api.config";
import { getExceptionMessage } from "@/core/exceptions/translate-exception-code";

const baseHttpClient = ky.create({
	baseUrl: API_BASE_URL,
	retry: { limit: 1 },
	timeout: 20_000,
	hooks: {
		beforeError: [
			({ error }) => {
				if (isHTTPError(error)) {
					error.message = getExceptionMessage(error);
				}

				return error;
			},
		],
	},
});

export { baseHttpClient };
