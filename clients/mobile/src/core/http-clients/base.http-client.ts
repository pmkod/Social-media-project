import { ApiConfig } from "@/core/configs/api.config";
import { deleteSessionCredentials } from "@/core/utils/session.utils";

export type RequestOptions = {
	json?: unknown;
	headers?: Record<string, string>;
	params?: Record<string, string>;
};

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

export class ApiError extends Error {
	code?: string;
	status: number;

	constructor(message: string, status: number, code?: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
	}
}

export class BaseHttpClient {
	protected baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	protected async request<T>(
		endpoint: string,
		method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
		options?: RequestOptions,
		customHeaders?: Record<string, string>,
	): Promise<T> {
		const cleanEndpoint = endpoint.replace(/^\//, "");
		let url = `${this.baseUrl}/${cleanEndpoint}`;

		if (options?.params) {
			const searchParams = new URLSearchParams(options.params);
			url += `?${searchParams.toString()}`;
		}

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			Accept: "application/json",
			...options?.headers,
			...customHeaders,
		};

		let body: string | undefined;
		if (options?.json !== undefined) {
			body = JSON.stringify(options.json);
		}

		let response: Response;
		try {
			response = await fetch(url, {
				method,
				headers,
				body,
			});
		} catch (networkError) {
			throw new ApiError(
				"Network request failed. Please check your connection.",
				0,
			);
		}

		if (!response.ok) {
			if (response.status === 401) {
				await deleteSessionCredentials();
			}

			let errorData: any = null;
			try {
				errorData = await response.json();
			} catch {
				errorData = null;
			}

			const errorCode = errorData?.error?.code || errorData?.code;
			const message =
				(errorCode && EXCEPTION_MESSAGES[errorCode]) ||
				errorData?.error?.message ||
				errorData?.message ||
				"Something went wrong. Please try again.";

			throw new ApiError(message, response.status, errorCode);
		}

		if (response.status === 204) {
			return {} as T;
		}

		try {
			return (await response.json()) as T;
		} catch {
			return {} as T;
		}
	}

	get<T>(endpoint: string, options?: RequestOptions) {
		return {
			json: () => this.request<T>(endpoint, "GET", options),
		};
	}

	post<T>(endpoint: string, options?: RequestOptions) {
		return {
			json: () => this.request<T>(endpoint, "POST", options),
		};
	}

	put<T>(endpoint: string, options?: RequestOptions) {
		return {
			json: () => this.request<T>(endpoint, "PUT", options),
		};
	}

	patch<T>(endpoint: string, options?: RequestOptions) {
		return {
			json: () => this.request<T>(endpoint, "PATCH", options),
		};
	}

	delete<T>(endpoint: string, options?: RequestOptions) {
		return {
			json: () => this.request<T>(endpoint, "DELETE", options),
		};
	}
}

export const baseHttpClient = new BaseHttpClient(ApiConfig.baseUrl);
