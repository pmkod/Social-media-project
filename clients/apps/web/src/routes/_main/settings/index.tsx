import { createFileRoute } from "@tanstack/react-router";
import { SettingsOverview } from "@/features/settings/settings-page.tsx";

export const Route = createFileRoute("/_main/settings/")({
	component: SettingsOverview,
});
