import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";

const footerLinks = [
	{ label: "Home", to: "/" },
	{ label: "Signup", to: "/signup" },
	{ label: "Privacy policy", to: "/privacy-policy" },
	{ label: "Terms", to: "/terms-of-service" },
	{ label: "About", to: "/about" },
	{ label: "Contact", to: "/contact" },
];

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-gray-200 px-6 py-8 bg-gray-100">
			<div className="mx-auto max-w-7xl">
				{/* Top level */}
				<div className="flex items-center justify-between">
					<Logo />
				</div>

				{/* Bottom level */}
				<div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
					<p className="text-sm text-muted-foreground">
						© {currentYear} Graphy. All rights reserved.
					</p>
					<nav className="flex flex-wrap items-center gap-4 sm:gap-6">
						{footerLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className="text-sm text-muted-foreground no-underline hover:text-foreground transition-colors"
							>
								{link.label}
							</Link>
						))}
					</nav>
				</div>
			</div>
		</footer>
	);
}
