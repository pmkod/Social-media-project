import { Link } from "@tanstack/react-router";
import { Button } from "@/core/components/ui/button";
import { Logo } from "./logo";

const navLinks = [
	{ label: "About", to: "/about" },
	{ label: "Careers", to: "/careers" },
	{ label: "History", to: "/history" },
	{ label: "Services", to: "/services" },
	{ label: "Projects", to: "/projects" },
	{ label: "Blog", to: "/blog" },
];

export function Header() {
	return (
		<header className="w-full">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
				{/* Logo */}
				<Link to="/" className="inline-flex items-center gap-2.5">
					<Logo />
				</Link>

				{/* Navigation */}
				<nav className="hidden items-center gap-8 md:flex">
					{navLinks.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className="nav-link text-[15px] font-medium"
						>
							{link.label}
						</Link>
					))}
				</nav>

				{/* Actions */}
				<div className="flex items-center gap-3">
					<Button
						asChild
						className="h-auto rounded-lg bg-[#4fb8b2] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3da8a2]"
					>
						<Link to="/login">Login</Link>
					</Button>
					<Button
						asChild
						className="h-auto rounded-lg bg-[#f1f5f4] px-6 py-2.5 text-sm font-semibold text-[#4fb8b2] hover:bg-[#e4ebe9]"
					>
						<Link to="/signup">Register</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
