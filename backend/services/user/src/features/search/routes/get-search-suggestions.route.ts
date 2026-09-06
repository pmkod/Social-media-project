import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import type { HonoEnv } from "@/core/types/hono-env";
import { SearchRoutesTag } from "../search.constants";

const routeDef = createRoute({
	method: "get",
	path: "/search/suggestions",
	summary: "Get text search suggestions",
	tags: [SearchRoutesTag],
	request: {
		query: z.object({ q: z.string().trim().min(1).max(100) }),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Text suggestions for the query",
			content: {
				"application/json": {
					schema: z.object({ suggestions: z.array(z.string()) }),
				},
			},
		},
	},
});

const getSearchSuggestionsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoEnv
>({
	route: routeDef,
	handler: (c) => c.json({ suggestions: [] }),
});

export { getSearchSuggestionsRoute };
