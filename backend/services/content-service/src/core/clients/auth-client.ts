import { environment } from "@/core/config/environment.configuration";
import { AppError, ErrorCodes } from "@/core/errors/app-error";

type ValidateTokenResponse = {
	isValid: boolean;
	userId?: string;
};

export async function validateToken(token: string): Promise<ValidateTokenResponse> {
	try {
		const response = await fetch(`${environment.AUTH_SERVICE_URL}/internal/auth/validate-token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ token }),
		});

		if (!response.ok) {
			throw new AppError({
				message: "Failed to validate token",
				code: ErrorCodes.INTERNAL_ERROR,
				statusCode: 500,
			});
		}

		return response.json() as Promise<ValidateTokenResponse>;
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}

		throw new AppError({
			message: "Auth service unavailable",
			code: ErrorCodes.INTERNAL_ERROR,
			statusCode: 500,
		});
	}
}
