import { cn } from "@/core/lib/utils.ts";

function Container({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="px-7">
			<div className={cn("mx-auto max-w-screen-2xl", className)}>
				{children}
			</div>
		</div>
	);
}

export { Container };
