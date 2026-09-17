import ky, { isHTTPError } from "ky";
import { ApiConfig } from "@/core/configs/api.config";

export const EXCEPTION_MESSAGES: Record<string, string> = {
	incorrect_email_or_password: "Incorrect email or password.",
	email_already_exists: "An account already uses this email address.",
	username_already_exists: "This username is already taken.",
	invalid_verification_code: "The verification code is invalid.",
	invalid_verification_data: "The verification request is invalid.",
	verification_already_used: "This verification request has already been used.",
	verification_expired: "The verification request has expired.",
	verification_attempts_limit_reached:
		"Too many verification attempts. Please request a new code.",
	verification_code_resends_limit_reached:
		"The verification code resend limit has been reached.",
	verification_not_completed: "Verification has not been completed.",
	verification_not_found_or_expired:
		"The verification request was not found or has expired.",
	user_not_found: "User not found.",
};

const normalizedBaseUrl = ApiConfig.baseUrl.endsWith("/")
	? ApiConfig.baseUrl
	: `${ApiConfig.baseUrl}/`;

const baseHttpClient = ky.create({
	baseUrl: normalizedBaseUrl,
	retry: { limit: 1 },
	hooks: {
		beforeError: [
			async ({ request, options, error }) => {
				if (isHTTPError(error)) {
					try {
						const errorData =
							(error as any).data ??
							(await error.response.clone().json().catch(() => null));
						const errorCode = errorData?.error?.code || errorData?.code;

						if (errorCode && EXCEPTION_MESSAGES[errorCode]) {
							error.message = EXCEPTION_MESSAGES[errorCode];
						} else if (errorData?.error?.message || errorData?.message) {
							error.message = errorData?.error?.message || errorData?.message;
						} else {
							error.message = "Something went wrong. Please try again.";
						}
					} catch {
						error.message = "Something went wrong. Please try again.";
					}
				} else {
					error.message = "Something went wrong. Please try again.";
				}

				console.log(`Request to ${request.url} failed`);
				return error;
			},
		],
	},
});

export { baseHttpClient };
