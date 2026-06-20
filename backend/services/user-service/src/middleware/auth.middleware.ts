import { createMiddleware } from "hono/factory";
import { validateToken } from "@/clients/auth-client";
import { AppError, ErrorCodes } from "@/errors/app-error";

export type AuthContext = {
	Variables: {
		userId: string;
	};
};

export const authMiddleware = createMiddleware<AuthContext>(async (c, next) => {
	const authorization = c.req.header("Authorization");

	if (!authorization) {
		throw new AppError({
			message: "Missing authorization header",
			code: ErrorCodes.UNAUTHORIZED,
			statusCode: 401,
		});
	}

	const [scheme, token] = authorization.split(" ");

	if (scheme !== "Bearer" || !token) {
		throw new AppError({
			message: "Invalid authorization header",
			code: ErrorCodes.UNAUTHORIZED,
			statusCode: 401,
		});
	}

	const validation = await validateToken(token);

	if (!validation.isValid || !validation.userId) {
		throw new AppError({
			message: "Invalid token",
			code: ErrorCodes.UNAUTHORIZED,
			statusCode: 401,
		});
	}

	c.set("userId", validation.userId);
	await next();
});
