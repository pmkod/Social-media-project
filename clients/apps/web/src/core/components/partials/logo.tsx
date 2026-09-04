type LogoProps = {
	className?: string;
	compactBelowLaptop?: boolean;
};

export function Logo({
	className = "",
	compactBelowLaptop = false,
}: LogoProps) {
	return (
		<p className={`text-2xl font-bold ${className}`}>
			C
			<span
				className={compactBelowLaptop ? "sr-only lg:not-sr-only" : undefined}
			>
				hillspace
			</span>
		</p>
	);
}
