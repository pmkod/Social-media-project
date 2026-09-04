import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ChillzFeed } from "@/features/chillz/chillz-feed.tsx";

export const Route = createFileRoute("/_main/chillz/$chillzId")({
	validateSearch: z.object({ focusComment: z.boolean().optional() }),
	component: ChillzPage,
});

function ChillzPage() {
	const { chillzId } = Route.useParams();
	const { focusComment } = Route.useSearch();
	return <ChillzFeed chillzId={chillzId} focusComment={focusComment} />;
}
