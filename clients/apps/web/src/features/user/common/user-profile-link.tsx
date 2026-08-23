import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import type { User } from "./user.ts";

type UserProfileLinkProps = Omit<ComponentProps<"a">, "href"> & {
	user: Pick<User, "username">;
};

function UserProfileLink({
	user,
	children,
	className,
	...props
}: UserProfileLinkProps) {
	return (
		<Link
			to="/$username"
			params={{ username: `@${user.username}` }}
			className={className}
			{...props}
		>
			{children}
		</Link>
	);
}

export { UserProfileLink };
