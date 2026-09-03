import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_base/terms-of-service")({
	component: TermsOfServicePage,
});

function TermsOfServicePage() {
	return (
		<main className="w-full px-6 py-10 sm:py-14">
			<article className="mx-auto w-full max-w-3xl">
				<p className="text-sm font-medium text-muted-foreground">Goodspace</p>
				<h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
					Terms of service
				</h1>
				<p className="mt-4 text-base leading-7 text-muted-foreground">
					These terms describe the simple rules for using Goodspace.
				</p>

				<div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
					<section>
						<h2 className="text-lg font-semibold text-foreground">
							Using Goodspace
						</h2>
						<p className="mt-2">
							By creating an account or using Goodspace, you agree to follow
							these terms and our privacy policy. You must provide accurate
							information and keep your account secure.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							Your content
						</h2>
						<p className="mt-2">
							You keep ownership of the content you post. By posting it, you
							give Goodspace permission to display and share it as needed to
							operate the service. Only share content you have the right to
							share.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							Be respectful
						</h2>
						<p className="mt-2">
							Do not use Goodspace to break the law, harm others, impersonate
							people, distribute harmful software, or abuse the service. We may
							remove content or restrict accounts that violate these rules.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							Service changes
						</h2>
						<p className="mt-2">
							We work to keep Goodspace available and useful, but features may
							change or be temporarily unavailable. We may suspend or end access
							when necessary to protect the service or its community.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							Terms updates
						</h2>
						<p className="mt-2">
							When these terms change, we will publish the new version on this
							page. By continuing to use Goodspace, you accept the updated
							terms.
						</p>
					</section>
				</div>
			</article>
		</main>
	);
}
