import ky, { isHTTPError } from "ky";
import { ApiConfig } from "@/core/configs/api.config.ts";
import * as m from "@/paraglide/messages.js";

const baseHttpClient = ky.create({
	baseUrl: ApiConfig.baseUrl,
	retry: { limit: 1 },
	hooks: {
		beforeError: [
			({ request, options, error }) => {
				if (isHTTPError(error)) {
					const errorResponse = error.data as
						| { error?: { code?: string } }
						| undefined;
					const errorCode = errorResponse?.error?.code;

					const isLanguageKey = (key: string): key is keyof typeof m =>
						key in m;

					error.message =
						errorCode && isLanguageKey(errorCode)
							? ((m[errorCode] as () => string)?.() ??
								m.exception_something_went_wrong())
							: m.exception_something_went_wrong();
				} else {
					error.message = m.exception_something_went_wrong();
				}

				console.log(`Request to ${request.url} failed`, options.context);

				return error;
			},
		],
	},
});

export { baseHttpClient };
