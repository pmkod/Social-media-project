import { Link } from "@tanstack/react-router";

interface LogoProps {
	className?: string;
}

export function Logo({ className = "" }: LogoProps) {
	return (
		<Link to="/" className={` ${className}`}>
			<p className="text-2xl font-bold">Goodspace</p>
		</Link>
	);
}
