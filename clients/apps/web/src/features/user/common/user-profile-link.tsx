import { Link } from "@tanstack/react-router";
import type { MouseEventHandler, ReactNode } from "react";
import type { User } from "./user.ts";

type UserProfileLinkProps = {
	user: Pick<User, "username">;
	children: ReactNode;
	className?: string;
	onClick?: MouseEventHandler<HTMLAnchorElement>;
};

function UserProfileLink({
	user,
	children,
	className,
	onClick,
}: UserProfileLinkProps) {
	return (
		<Link
			to="/$username"
			params={{ username: `@${user.username}` }}
			className={className}
			onClick={onClick}
		>
			{children}
		</Link>
	);
}

export { UserProfileLink };
