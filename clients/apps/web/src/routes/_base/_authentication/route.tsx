import { createFileRoute, Outlet } from "@tanstack/react-router";

function AuthShowcase() {
	return (
		<div className="flex h-full w-full flex-col justify-center gap-8 lg:gap-10">
			<div className="flex flex-col gap-3">
				<h1 className="text-2xl font-semibold tracking-tight text-balance xl:text-3xl text-slate-900 dark:text-slate-100">
					Un espace pour partager, échanger et se retrouver.
				</h1>
				<p className="max-w-md text-sm leading-relaxed text-muted-foreground">
					Connectez-vous pour explorer, partager et interagir avec votre
					communauté.
				</p>
			</div>

			<div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
				<img
					src="/auth-illustration.jpg"
					alt="Illustration réseau social"
					className="h-auto w-full object-cover"
					loading="lazy"
				/>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_base/_authentication")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex w-full flex-1 flex-col">
			<main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
				<div className="flex w-full max-w-7xl items-center justify-center gap-8 lg:gap-12 relative">
					{/* Showcase — hidden on mobile, left on desktop */}
					<div className="hidden lg:block flex-1 max-w-xl">
						<AuthShowcase />
					</div>

					{/* Thin vertical separator line that doesn't take full height */}
					<div className="hidden lg:block w-px h-80 max-h-[480px] bg-slate-200 dark:border-slate-800 dark:bg-slate-800 self-center shrink-0 rounded-full" />

					{/* Auth form — right on desktop */}
					<div className="flex-1 w-full max-w-lg flex items-center justify-center lg:justify-start">
						<div className="w-full max-w-lg">
							<Outlet />
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
