import { createFileRoute } from "@tanstack/react-router";
import { SettingsLayout } from "@/features/settings/settings-page.tsx";

export const Route = createFileRoute("/_main/settings")({
	component: SettingsLayout,
});
