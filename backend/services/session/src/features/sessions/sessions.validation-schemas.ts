import { z } from "@hono/zod-openapi";

const SessionIdSchema = z.string().uuid();
const UserIdSchema = z.string().trim().min(1).max(128);

const SessionSchema = z.object({
	id: SessionIdSchema,
	active: z.boolean(),
	logoutAt: z.string().datetime().nullable(),
	userId: UserIdSchema,
	ipAddress: z.string().nullable(),
	userAgent: z.string().nullable(),
	createdAt: z.string().datetime(),
});

const SessionWithTokenSchema = SessionSchema.extend({
	token: z.string().min(1),
});

const CreateSessionRequestBody = z.object({
	userId: UserIdSchema,
	ipAddress: z.string().trim().min(1).max(255).nullable().optional(),
	userAgent: z.string().trim().min(1).max(1024).nullable().optional(),
});

const SessionIdParams = z.object({
	sessionId: SessionIdSchema,
});

const VerifySessionRequestBody = z.object({
	id: SessionIdSchema,
	token: z.string().min(1).max(512),
});

export {
	CreateSessionRequestBody,
	SessionIdParams,
	SessionSchema,
	SessionWithTokenSchema,
	VerifySessionRequestBody,
};
