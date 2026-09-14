import { Link } from "@tanstack/react-router";
import { Button } from "@/core/components/ui/button";
import * as m from "@/paraglide/messages.js";
import { Logo } from "./logo";

export function Header() {
	return (
		<header className="w-full px-6">
			<div className="mx-auto flex max-w-screen-2xl items-center justify-between py-4">
				{/* Logo */}
				<Link to="/">
					<Logo />
				</Link>

				{/* Actions */}
				<div className="flex items-center gap-3">
					<Button variant="ghost" asChild>
						<Link to="/">{m.header_login()}</Link>
					</Button>
					<Button asChild>
						<Link to="/signup">{m.header_signup()}</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
