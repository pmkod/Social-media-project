import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/core/lib/utils.ts";

type UserProfileStatItemProps = {
	label: ReactNode;
	value: ReactNode;
	onClick?: ComponentProps<"button">["onClick"];
};

function UserProfileStatItem({
	label,
	value,
	onClick,
}: UserProfileStatItemProps) {
	const className = cn(
		"rounded-sm text-left",
		onClick &&
			"cursor-pointer transition hover:text-foreground hover:underline",
	);
	const content = (
		<>
			<strong className="text-foreground">{value}</strong> {label}
		</>
	);

	if (onClick) {
		return (
			<button type="button" onClick={onClick} className={className}>
				{content}
			</button>
		);
	}

	return <span className={className}>{content}</span>;
}

export { UserProfileStatItem };
export type { UserProfileStatItemProps };
