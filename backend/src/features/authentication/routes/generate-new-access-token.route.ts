import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { AuthenticationRoutesTag } from "../authentication.constants";
import { GenerateNewAccessTokenValidationSchema } from "../authentication.validation-schemas";
import { generateAccessToken, verifyRefreshToken } from "../jwt.functions";

// import type { HttpStatus } from "@/core/constants/http-status";

const generateNewAccessTokenRoute = new OpenAPIHono();

const routeDef = createRoute({
	method: "post",
	path: "/access-tokens",
	summary: "Generate new access token",
	tags: [AuthenticationRoutesTag],
	request: {
		body: {
			content: {
				"application/json": {
					schema: GenerateNewAccessTokenValidationSchema,
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
});

generateNewAccessTokenRoute.openapi(routeDef, async (c) => {
	const reqBody = c.req.valid("json");

	const refreshTokenPayload = verifyRefreshToken(reqBody.refreshToken);

	const refreshTokenInDb = await prisma.refreshToken.findUniqueOrThrow({
		where: {
			id: refreshTokenPayload.refreshTokenId,
			active: true,
			disabledAt: null,
		},
		select: { id: true, userId: true },
	});

	const user = await prisma.user.findUniqueOrThrow({
		where: { id: refreshTokenInDb.userId, active: true },
		select: { id: true, role: true },
	});

	const accessToken = generateAccessToken({
		refreshTokenId: refreshTokenInDb.id,
		userId: user.id,
		userRole: user.role,
	});

	return c.json({ accessToken });
});

export { generateNewAccessTokenRoute };

// const generateNewAccessToken = async (req: Request, res: Response) => {
// 	console.log(req.body);

// };
