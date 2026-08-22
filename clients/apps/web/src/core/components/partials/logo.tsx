import { Link } from "@tanstack/react-router";

type LogoProps = {
	className?: string;
};

export function Logo({ className = "" }: LogoProps) {
	return (
		<Link to="/" className={` ${className}`}>
			<p className="text-2xl font-bold">Chillspace</p>
		</Link>
	);
}
