import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

// Keep previously shared links working after the Chillz rename.
export const Route = createFileRoute("/_main/sparks")({
	validateSearch: z.object({ q: z.string().trim().max(100).optional() }),
	beforeLoad: ({ search }) => {
		throw redirect({ to: "/chillz", search, replace: true, statusCode: 301 });
	},
});
