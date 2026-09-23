import { createFileRoute } from "@tanstack/react-router";
import * as m from "@/paraglide/messages.js";

export const Route = createFileRoute("/_base/terms")({
	component: TermsOfServicePage,
});

function TermsOfServicePage() {
	return (
		<main className="w-full px-6 py-10 sm:py-14">
			<article className="mx-auto w-full max-w-3xl">
				<p className="text-sm font-medium text-muted-foreground">Waka</p>
				<h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
					{m.terms_title()}
				</h1>
				<p className="mt-4 text-base leading-7 text-muted-foreground">
					{m.terms_intro()}
				</p>

				<div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
					<section>
						<h2 className="text-lg font-semibold text-foreground">
							{m.terms_using_title()}
						</h2>
						<p className="mt-2">{m.terms_using_text()}</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							{m.terms_content_title()}
						</h2>
						<p className="mt-2">{m.terms_content_text()}</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							{m.terms_respect_title()}
						</h2>
						<p className="mt-2">{m.terms_respect_text()}</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							{m.terms_changes_title()}
						</h2>
						<p className="mt-2">{m.terms_changes_text()}</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							{m.terms_updates_title()}
						</h2>
						<p className="mt-2">{m.terms_updates_text()}</p>
					</section>
				</div>
			</article>
		</main>
	);
}
