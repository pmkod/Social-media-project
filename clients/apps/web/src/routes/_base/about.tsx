import {
	RiArrowRightSLine,
	RiChatSmile3Line,
	RiCheckLine,
	RiHeartLine,
} from "@remixicon/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/core/components/ui/button";

export const Route = createFileRoute("/_base/about")({
	head: () => ({
		meta: [
			{
				title: "À propos — Chillspace",
			},
		],
	}),
	component: AboutPage,
});

const values = [
	{
		icon: RiChatSmile3Line,
		number: "01",
		title: "Des échanges qui comptent",
		text: "Ici, on prend le temps de répondre, de rire et de partager ce qui nous ressemble.",
	},
	{
		icon: RiHeartLine,
		number: "02",
		title: "Une communauté à taille humaine",
		text: "Pas de course à la visibilité. Seulement des personnes, des idées et de vrais liens.",
	},
	{
		icon: RiCheckLine,
		number: "03",
		title: "Un espace qui vous appartient",
		text: "Vous choisissez ce que vous partagez, avec qui, et la place que vous donnez au digital.",
	},
];

function AboutPage() {
	return (
		<main className="w-full overflow-hidden">
			<section className="relative isolate border-b border-border/70 bg-[#fcfaf7] px-6 py-16 dark:bg-[#171516] sm:py-24 lg:py-28">
				<div className="pointer-events-none absolute -right-24 -top-28 -z-10 size-80 rounded-full bg-primary/10 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-32 left-1/3 -z-10 size-72 rounded-full bg-orange-200/30 blur-3xl dark:bg-orange-400/10" />

				<div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
					<div>
						<div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
							<span className="h-px w-8 bg-primary" />À propos de Chillspace
						</div>

						<h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[1.03] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">
							Un espace pour se retrouver,{" "}
							<span className="text-primary">vraiment.</span>
						</h1>

						<p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
							Chillspace est un réseau social pensé pour les conversations qui
							font du bien — simple, humain et sans le bruit autour.
						</p>

						<div className="mt-9 flex flex-col gap-3 sm:flex-row">
							<Button size="lg" asChild>
								<Link to="/signup">Rejoindre Chillspace</Link>
							</Button>
							<Button size="lg" variant="ghost" asChild>
								<Link to="/" className="group">
									Découvrir l’accueil
									<RiArrowRightSLine className="size-5 transition-transform group-hover:translate-x-1" />
								</Link>
							</Button>
						</div>
					</div>

					<div className="relative mx-auto w-full max-w-md lg:justify-self-end">
						<div className="absolute -left-4 top-10 h-32 w-32 rounded-[2rem] border border-primary/20 bg-primary/10 sm:-left-8" />
						<div className="relative rounded-[2rem] border border-foreground/10 bg-foreground p-7 text-background shadow-2xl shadow-foreground/10 sm:p-9 dark:bg-card dark:text-foreground">
							<div className="flex items-start justify-between gap-4">
								<span className="rounded-full bg-background/10 px-3 py-1 text-xs font-medium text-background/70 dark:bg-foreground/10 dark:text-foreground/70">
									Notre intention
								</span>
								<span className="text-sm text-background/45 dark:text-foreground/45">
									2026
								</span>
							</div>

							<p className="mt-16 max-w-xs text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
								« Plus de présence. Moins de pression. »
							</p>

							<div className="mt-16 flex items-center justify-between border-t border-background/15 pt-5 dark:border-foreground/15">
								<div>
									<p className="text-sm font-medium">Une communauté sincère</p>
									<p className="mt-1 text-xs text-background/50 dark:text-foreground/50">
										Imaginée pour respirer
									</p>
								</div>
								<div
									className="flex -space-x-2"
									role="img"
									aria-label="Membres de la communauté"
								>
									{[
										"bg-orange-300",
										"bg-rose-300",
										"bg-sky-300",
										"bg-emerald-300",
									].map((color, index) => (
										<span
											key={color}
											className={`flex size-8 items-center justify-center rounded-full border-2 border-foreground text-xs font-semibold text-foreground ${color}`}
											aria-hidden="true"
										>
											{["A", "M", "S", "+"][index]}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="px-6 py-16 sm:py-24">
				<div className="mx-auto max-w-6xl">
					<div className="max-w-2xl">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
							Notre façon de voir les choses
						</p>
						<h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
							Le digital peut aussi laisser de la place à l’essentiel.
						</h2>
					</div>

					<div className="mt-12 grid gap-6 md:grid-cols-3">
						{values.map(({ icon: Icon, number, title, text }) => (
							<article
								key={number}
								className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40 sm:p-7"
							>
								<div className="flex items-center justify-between">
									<div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
										<Icon className="size-5" />
									</div>
									<span className="text-sm font-medium text-muted-foreground">
										{number}
									</span>
								</div>
								<h3 className="mt-8 text-xl font-semibold tracking-[-0.025em]">
									{title}
								</h3>
								<p className="mt-3 text-sm leading-7 text-muted-foreground">
									{text}
								</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="border-y border-border/70 bg-muted/40 px-6 py-16 sm:py-24">
				<div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-24">
					<p className="max-w-sm text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
						Parce qu’une bonne conversation peut changer toute une journée.
					</p>
					<div className="space-y-5 text-base leading-8 text-muted-foreground">
						<p>
							Nous avons créé Chillspace avec une idée simple : les réseaux
							sociaux devraient nous rapprocher de ce qui nous fait du bien, pas
							nous épuiser.
						</p>
						<p>
							Alors nous construisons un endroit calme pour partager une pensée,
							retrouver ses proches et découvrir de nouvelles voix — à votre
							rythme.
						</p>
						<div className="flex items-center gap-2 pt-2 text-sm font-medium text-foreground">
							<span className="size-2 rounded-full bg-primary" />
							Fait avec attention, pour de vraies personnes.
						</div>
					</div>
				</div>
			</section>

			<section className="px-6 py-16 sm:py-24">
				<div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-primary px-7 py-10 text-primary-foreground sm:px-10 sm:py-12 lg:flex-row lg:items-center">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
							On se retrouve ?
						</p>
						<h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
							La prochaine belle conversation commence peut-être ici.
						</h2>
					</div>
					<Button size="lg" colorScheme="white" asChild>
						<Link to="/signup">Créer mon espace</Link>
					</Button>
				</div>
			</section>
		</main>
	);
}
