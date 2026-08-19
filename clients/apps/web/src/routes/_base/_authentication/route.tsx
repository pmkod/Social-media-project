import { createFileRoute, Outlet } from "@tanstack/react-router";

function AuthShowcase() {
	return (
		<div className="flex h-full w-full flex-col justify-center gap-6 lg:gap-12">
			{/* Texte */}
			<div className="flex flex-col gap-3 text-center lg:text-left">
				<h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl xl:text-6xl text-foreground">
					A space to share, connect, and find your people.
				</h1>
			</div>

			{/* Three portrait cards aligned with the text, hidden on mobile */}
			<div
				className="hidden lg:block relative w-full"
				style={{ height: "310px" }}
			>
				{/* Left card — tilted behind */}
				<div
					className="absolute overflow-hidden rounded-[20px] shadow-xl"
					style={{
						width: "150px",
						height: "250px",
						top: "25px",
						left: "48px",
						transform: "rotate(-12deg)",
						transformOrigin: "bottom center",
						zIndex: 1,
					}}
				>
					<img
						src="/auth-photo-1.jpg"
						alt="Everyday moment"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							objectPosition: "center top",
							display: "block",
						}}
					/>
				</div>

				{/* Center card — in front */}
				<div
					className="absolute overflow-hidden rounded-[20px] shadow-2xl"
					style={{
						width: "170px",
						height: "280px",
						top: "10px",
						left: "135px",
						zIndex: 3,
					}}
				>
					<img
						src="/auth-photo-2.jpg"
						alt="Everyday moment"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							objectPosition: "center top",
							display: "block",
						}}
					/>
				</div>

				{/* Right card — tilted between the others */}
				<div
					className="absolute overflow-hidden rounded-[20px] shadow-xl"
					style={{
						width: "150px",
						height: "250px",
						top: "25px",
						left: "245px",
						transform: "rotate(12deg)",
						transformOrigin: "bottom center",
						zIndex: 2,
					}}
				>
					<img
						src="/auth-photo-3.jpg"
						alt="Everyday moment"
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
			<main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:py-10">
				<div className="flex w-full max-w-7xl flex-col items-center justify-center gap-8 lg:flex-row lg:justify-between lg:gap-12 relative">
					{/* Showcase — text visible on mobile & desktop, trio of images hidden on mobile */}
					<div className="w-full lg:flex-1 max-w-xl">
						<AuthShowcase />
					</div>

					{/* Thin vertical separator line that doesn't take full height on desktop */}
					<div className="hidden lg:block w-px h-80 max-h-[480px] bg-border self-center shrink-0 rounded-full" />

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
