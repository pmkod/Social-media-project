import type { Context } from "hono";

const normalizeHeader = (value: string | undefined, maxLength: number) => {
	const normalizedValue = value?.trim();
	return normalizedValue ? normalizedValue.slice(0, maxLength) : null;
};

const getRequestClientMetadata = (c: Context) => ({
	ipAddress: normalizeHeader(
		c.req.header("x-forwarded-for")?.split(",")[0] ??
			c.req.header("x-real-ip"),
		255,
	),
	userAgent: normalizeHeader(c.req.header("user-agent"), 1024),
});

export { getRequestClientMetadata };
