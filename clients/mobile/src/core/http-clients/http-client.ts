import { ApiConfig } from "@/core/configs/api.config";
import {
	createSessionAuthorizationHeader,
	getSessionCredentials,
} from "@/core/utils/session.utils";
import {
	BaseHttpClient,
	baseHttpClient,
	type RequestOptions,
} from "./base.http-client";

class AuthenticatedHttpClient extends BaseHttpClient {
	private async getAuthHeaders(): Promise<Record<string, string>> {
		const credentials = await getSessionCredentials();
		if (credentials) {
			return {
				Authorization: createSessionAuthorizationHeader(credentials),
			};
		}
		return {};
	}

	override get<T>(endpoint: string, options?: RequestOptions) {
		return {
			json: async () => {
				const authHeaders = await this.getAuthHeaders();
				return this.request<T>(endpoint, "GET", options, authHeaders);
			},
		};
	}

	override post<T>(endpoint: string, options?: RequestOptions) {
		return {
			json: async () => {
				const authHeaders = await this.getAuthHeaders();
				return this.request<T>(endpoint, "POST", options, authHeaders);
			},
		};
	}

	override put<T>(endpoint: string, options?: RequestOptions) {
		return {
			json: async () => {
				const authHeaders = await this.getAuthHeaders();
				return this.request<T>(endpoint, "PUT", options, authHeaders);
			},
		};
	}

	override patch<T>(endpoint: string, options?: RequestOptions) {
		return {
			json: async () => {
				const authHeaders = await this.getAuthHeaders();
				return this.request<T>(endpoint, "PATCH", options, authHeaders);
			},
		};
	}

	override delete<T>(endpoint: string, options?: RequestOptions) {
		return {
			json: async () => {
				const authHeaders = await this.getAuthHeaders();
				return this.request<T>(endpoint, "DELETE", options, authHeaders);
			},
		};
	}
}

export const httpClient = new AuthenticatedHttpClient(ApiConfig.baseUrl);
export { baseHttpClient };
