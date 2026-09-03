type LogoProps = {
	className?: string;
};

export function Logo({ className = "" }: LogoProps) {
	return <p className={`text-2xl font-bold ${className}`}>Chillspace</p>;
}
