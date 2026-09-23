type LogoProps = {
	className?: string;
	compactBelowLaptop?: boolean;
};

export function Logo({
	className = "",
	compactBelowLaptop = false,
}: LogoProps) {
	const visibilityClass = compactBelowLaptop ? "sr-only lg:not-sr-only" : "";

	return (
		<p className={className}>
			<img
				src="/images/waka-black-logo.png"
				alt="Waka"
				className={`h-auto w-28 dark:hidden ${visibilityClass}`}
			/>
			<img
				src="/images/waka-white-logo.png"
				alt="Waka"
				className={`hidden h-auto w-28 dark:block ${visibilityClass}`}
			/>
		</p>
	);
}
