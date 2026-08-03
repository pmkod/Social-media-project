import { createFileRoute, Outlet } from "@tanstack/react-router";

function AuthShowcase() {
	return (
		<div className="flex h-full w-full flex-col justify-center gap-10 lg:gap-12">
			{/* Texte */}
			<div className="flex flex-col gap-3">
				<h1 className="text-5xl font-semibold tracking-tight text-balance xl:text-6xl text-slate-900 dark:text-slate-100">
					Un espace pour partager, échanger et se retrouver.
				</h1>
			</div>

			{/* Photos en éventail — 3 cartes portrait */}
			<div className="relative w-full bg-blue-200" style={{ height: "300px" }}>
				{/* Carte gauche — inclinée à gauche, derrière */}
				<div
					className="absolute overflow-hidden rounded-[20px] shadow-xl"
					style={{
						width: "148px",
						height: "248px",
						top: "50%",
						left: "50%",
						transform:
							"translate(-50%, -50%) rotate(-14deg) translateX(-120px)",
						zIndex: 1,
					}}
				>
					<img
						src="/auth-photo-1.jpg"
						alt="Moment quotidien"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							objectPosition: "center top",
							display: "block",
						}}
					/>
				</div>

				{/* Carte centre — droite, devant */}
				<div
					className="absolute overflow-hidden rounded-[20px] shadow-2xl"
					style={{
						width: "168px",
						height: "282px",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						zIndex: 3,
					}}
				>
					<img
						src="/auth-photo-2.jpg"
						alt="Moment quotidien"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							objectPosition: "center top",
							display: "block",
						}}
					/>
				</div>

				{/* Carte droite — inclinée à droite, entre les deux */}
				<div
					className="absolute overflow-hidden rounded-[20px] shadow-xl"
					style={{
						width: "148px",
						height: "248px",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%) rotate(14deg) translateX(120px)",
						zIndex: 2,
					}}
				>
					<img
						src="/auth-photo-3.jpg"
						alt="Moment quotidien"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							objectPosition: "center top",
							display: "block",
						}}
					/>
				</div>
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
				<div className="flex w-full max-w-7xl items-center justify-between gap-8 lg:gap-12 relative">
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
