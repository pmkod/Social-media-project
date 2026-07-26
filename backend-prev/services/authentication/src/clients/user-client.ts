import { environment } from "@/config/environment.configuration";
import { AppError } from "@/errors/app-error";

export type User = {
	id: string;
	email: string;
	username: string;
	fullName: string;
	emailVerified: boolean;
	active: boolean;
	displayName: string | null;
	bio: string | null;
	avatarUrl: string | null;
	location: string | null;
	website: string | null;
	createdAt: string;
	updatedAt: string;
};

type ApiSuccessResponse<T> = {
	success: true;
	data: T;
};

type ApiErrorResponse = {
	success: false;
	error: {
		code: string;
		message: string;
		details?: Record<string, unknown>;
	};
};

function handleUserServiceError(response: Response, errorResponse: ApiErrorResponse): never {
	throw new AppError({
		message: errorResponse.error.message,
		code: errorResponse.error.code,
		statusCode: response.status,
		details: errorResponse.error.details,
	});
}

async function parseResponse<T>(response: Response): Promise<T> {
	const body = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;

	if (!response.ok || !body.success) {
		handleUserServiceError(response, body as ApiErrorResponse);
	}

	return (body as ApiSuccessResponse<T>).data;
}

export async function validateUserCredentials(input: {
	email: string;
	password: string;
}): Promise<User> {
	const response = await fetch(
		`${environment.USER_SERVICE_URL}/internal/users/validate-credentials`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(input),
		},
	);

	return parseResponse<User>(response);
}

export async function getUserByEmail(email: string): Promise<User | null> {
	const response = await fetch(
		`${environment.USER_SERVICE_URL}/internal/users/by-email?email=${encodeURIComponent(email)}`,
		{ method: "GET", headers: { "Content-Type": "application/json" } },
	);

	return parseResponse<User | null>(response);
}

export async function getUserByUsername(username: string): Promise<User | null> {
	const response = await fetch(
		`${environment.USER_SERVICE_URL}/internal/users/by-username?username=${encodeURIComponent(username)}`,
		{ method: "GET", headers: { "Content-Type": "application/json" } },
	);

	return parseResponse<User | null>(response);
}

export async function getUserById(id: string): Promise<User> {
	const response = await fetch(`${environment.USER_SERVICE_URL}/internal/users/${id}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	return parseResponse<User>(response);
}

export async function createUser(input: {
	email: string;
	username: string;
	passwordHash: string;
	fullName: string;
}): Promise<{ id: string }> {
	const response = await fetch(`${environment.USER_SERVICE_URL}/internal/users`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});

	return parseResponse<{ id: string }>(response);
}
