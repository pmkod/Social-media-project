import { createFileRoute } from "@tanstack/react-router";
import { LatestChillzPage } from "@/features/chillz/latest-chillz-page.tsx";

export const Route = createFileRoute("/_main/chillz/")({
	component: LatestChillzPage,
});
