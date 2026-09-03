import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_base/privacy-policy")({
	component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
	return (
		<main className="w-full px-6 py-10 sm:py-14">
			<article className="mx-auto w-full max-w-3xl">
				<p className="text-sm font-medium text-muted-foreground">Goodspace</p>
				<h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
					Privacy policy
				</h1>
				<p className="mt-4 text-base leading-7 text-muted-foreground">
					This policy explains, in plain language, what information Goodspace
					uses and how we use it.
				</p>

				<div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
					<section>
						<h2 className="text-lg font-semibold text-foreground">
							Information we collect
						</h2>
						<p className="mt-2">
							We collect the information you provide when you create and use
							your account, such as your name and email address. We also store
							the content and interactions you choose to share on Goodspace,
							along with basic technical information needed to keep the service
							secure and reliable.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							How we use it
						</h2>
						<p className="mt-2">
							We use this information to provide Goodspace, keep your account
							secure, help people connect, respond to requests, and improve the
							product. We do not sell your personal information.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							When information is shared
						</h2>
						<p className="mt-2">
							Your public profile and content are visible to people who can
							access them in Goodspace. We may share limited information with
							trusted providers that help us operate the service, or when the
							law requires it.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							Your choices
						</h2>
						<p className="mt-2">
							You can review and update the information in your account. You can
							also choose what you share publicly. If you have a privacy
							question, please contact the Goodspace team.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-foreground">
							Policy updates
						</h2>
						<p className="mt-2">
							If this policy changes, we will publish the updated version on
							this page. Continuing to use Goodspace after an update means you
							accept the revised policy.
						</p>
					</section>
				</div>
			</article>
		</main>
	);
}
