import { createFileRoute } from "@tanstack/react-router";
import * as m from "@/paraglide/messages.js";

export const Route = createFileRoute("/_base/privacy-policy")({
	component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
	return (
		<main className="w-full px-6 py-10 sm:py-14">
			<article className="mx-auto w-full max-w-3xl">
				<p className="text-sm font-medium text-muted-foreground">Waka</p>
				<h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
					{m.privacy_title()}
				</h1>
				<p className="mt-4 text-base leading-7 text-muted-foreground">
					{m.privacy_intro()}
				</p>

				<div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
					<section>
						<h2 className="text-lg font-semibold text-foreground">
							{m.privacy_collect_title()}
						</h2>
						<p className="mt-2">{m.privacy_collect_text()}</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							{m.privacy_use_title()}
						</h2>
						<p className="mt-2">{m.privacy_use_text()}</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							{m.privacy_share_title()}
						</h2>
						<p className="mt-2">{m.privacy_share_text()}</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							{m.privacy_choices_title()}
						</h2>
						<p className="mt-2">{m.privacy_choices_text()}</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							{m.privacy_updates_title()}
						</h2>
						<p className="mt-2">{m.privacy_updates_text()}</p>
					</section>
				</div>
			</article>
		</main>
	);
}
