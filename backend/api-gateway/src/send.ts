import type { Context } from "hono";
import type { AuthenticatedUser } from "./types/authenticated-user";

type SendToParams = {
	authenticatedUser?: AuthenticatedUser;
	c: Context;
	target: string;
};

const createUpstreamHeaders = (
	incomingHeaders: Headers | Record<string, string>,
	authenticatedUser?: AuthenticatedUser,
) => {
	const headers = new Headers(incomingHeaders);
	headers.delete("host");
	headers.delete("Authorization");
	for (const headerName of Array.from(headers.keys())) {
		if (headerName.toLowerCase().startsWith("x-authenticated-")) {
			headers.delete(headerName);
		}
	}

	if (authenticatedUser) {
		headers.set("X-Authenticated-User-Id", authenticatedUser.id);
		headers.set("X-Authenticated-Session-Id", authenticatedUser.sessionId);
	}

	return headers;
};

const sendTo = async (params: SendToParams) => {
	const incomingUrl = new URL(params.c.req.url);
	const targetUrl = new URL(
		incomingUrl.pathname + incomingUrl.search,
		params.target,
	);

	const headers = createUpstreamHeaders(
		params.c.req.header(),
		params.authenticatedUser,
	);

	const response = await fetch(targetUrl.toString(), {
		method: params.c.req.method,
		headers,
		body: params.c.req.raw.body,
		// @ts-ignore
		duplex: "half",
	});

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
	});
};

export { createUpstreamHeaders, sendTo };
