import { Link } from "@tanstack/react-router";
import { Button } from "@/core/components/ui/button";
import { Logo } from "./logo";

export function Header() {
	return (
		<header className="w-full">
			<div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4">
				{/* Logo */}
				<Link to="/" className="inline-flex items-center gap-2.5">
					<Logo />
				</Link>

				{/* Actions */}
				<div className="flex items-center gap-3">
					<Button variant="ghost" asChild>
						<Link to="/">Login</Link>
					</Button>
					<Button asChild>
						<Link to="/signup">Signup</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
