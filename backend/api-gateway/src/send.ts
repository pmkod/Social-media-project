import type { Context } from "hono";
import type { AuthenticatedUser } from "./types/authenticated-user";

type SendToParams = {
	authenticatedUser?: AuthenticatedUser;
	c: Context;
	target: string;
};

const sendTo = async (params: SendToParams) => {
	const incomingUrl = new URL(params.c.req.url);
	const targetUrl = new URL(
		incomingUrl.pathname + incomingUrl.search,
		params.target,
	);

	const headers = new Headers(params.c.req.header());
	headers.delete("host");
	headers.delete("Authorization");
	headers.delete("X-Authenticated-User-Id");

	if (params.authenticatedUser) {
		headers.set("X-Authenticated-User-Id", params.authenticatedUser.id);
	}

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

export { sendTo };
