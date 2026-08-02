import { createFileRoute, Outlet } from "@tanstack/react-router";

function AuthIllustration() {
	return (
		<div className="flex flex-col items-center justify-center gap-6 text-center">
			<img
				src="/auth-illustration.jpg"
				alt="Illustration authentification"
				className="h-auto w-full max-w-md rounded-2xl object-cover"
				loading="lazy"
			/>
			<div className="max-w-sm">
				<h2 className="text-2xl font-semibold tracking-tight text-foreground">
					Bienvenue sur Graphy
				</h2>
				<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
					Connectez-vous pour explorer, partager et interagir avec votre
					communauté.
				</p>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_base/_authentication")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col">
			<main className="flex flex-1 items-center justify-center px-4 sm:px-6">
				<div className="grid w-full max-w-7xl gap-8 lg:grid-cols-2 lg:gap-16">
					{/* Illustration — hidden on mobile, left on desktop */}
					<div className="order-1 hidden items-center justify-center lg:flex">
						<AuthIllustration />
					</div>

					{/* Auth form */}
					<div className="order-2 flex items-center justify-center lg:justify-end">
						<div className="w-full max-w-lg">
							<Outlet />
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
