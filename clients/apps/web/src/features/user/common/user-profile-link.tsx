import { Link } from "@tanstack/react-router";
import type { MouseEventHandler, ReactNode } from "react";

type UserProfileLinkProps = {
	username?: string | null;
	children: ReactNode;
	className?: string;
	onClick?: MouseEventHandler<HTMLAnchorElement>;
};

function UserProfileLink({
	username,
	children,
	className,
	onClick,
}: UserProfileLinkProps) {
	if (!username) return <span className={className}>{children}</span>;

	return (
		<Link
			to="/$username"
			params={{ username: `@${username}` }}
			className={className}
			onClick={onClick}
		>
			{children}
		</Link>
	);
}

export { UserProfileLink };
