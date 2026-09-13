import { RiChatSmile3Line } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import * as m from "@/paraglide/messages.js";

export const Route = createFileRoute("/_main/discussions/")({
	component: DiscussionsIndexPage,
});

function DiscussionsIndexPage() {
	return (
		<div className="max-w-sm text-center">
			<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
				<RiChatSmile3Line className="size-8" />
			</div>
			<h2 className="text-xl font-bold">{m.discussions_intro_title()}</h2>
			<p className="mt-2 text-sm leading-6 text-muted-foreground">
				{m.discussions_intro_description()}
			</p>
		</div>
	);
}
