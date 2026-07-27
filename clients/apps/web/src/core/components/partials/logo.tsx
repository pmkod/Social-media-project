import { Link } from "@tanstack/react-router";

interface LogoProps {
	className?: string;
}

export function Logo({ className = "" }: LogoProps) {
	return (
		<Link to="/" className={`inline-flex items-center gap-2.5 ${className}`}>
			<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white">
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					strokeLinecap="round"
					role="img"
					aria-label="Graphy logo"
				>
					<line x1="7" y1="18" x2="11" y2="6" />
					<line x1="11" y1="18" x2="15" y2="6" />
					<line x1="15" y1="18" x2="19" y2="6" />
				</svg>
			</div>
			<span className="text-lg font-bold tracking-tight text-slate-800">
				Graphy
			</span>
		</Link>
	);
}
