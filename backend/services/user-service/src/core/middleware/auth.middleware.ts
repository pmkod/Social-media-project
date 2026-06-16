import { createMiddleware } from "hono/factory";
import { validateToken } from "@/core/clients/auth-client";
import { AppError, ErrorCodes } from "@/core/errors/app-error";

export type AuthContext = {
	Variables: {
		userId: string;
	};
};

export const authMiddleware = createMiddleware<AuthContext>(async (c, next) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new AppError({
			message: "Missing or invalid authorization header",
			code: ErrorCodes.UNAUTHORIZED,
			statusCode: 401,
		});
	}

	const token = authHeader.slice(7);
	const { isValid, userId } = await validateToken(token);

	if (!isValid || !userId) {
		throw new AppError({
			message: "Invalid or expired token",
			code: ErrorCodes.UNAUTHORIZED,
			statusCode: 401,
		});
	}

	c.set("userId", userId);
	await next();
});
