import { Link } from "@tanstack/react-router";
import * as m from "@/paraglide/messages.js";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { ThemeSwitcher } from "./theme-switcher";

export function Footer() {
	const currentYear = new Date().getFullYear();
	const footerLinks = [
		{ label: m.nav_home(), to: "/" },
		{ label: m.footer_signup(), to: "/signup" },
		{ label: m.footer_privacy(), to: "/privacy-policy" },
		{ label: m.footer_terms(), to: "/terms-of-service" },
		{ label: m.footer_about(), to: "/about" },
	];

	return (
		<footer className="border-t border-border px-6 py-8 bg-muted">
			<div className="mx-auto max-w-7xl">
				{/* Top level */}
				<div className="flex items-center justify-between">
					<Logo />
					<div className="flex items-center gap-2">
						<LanguageSwitcher />
						<ThemeSwitcher />
					</div>
				</div>

				{/* Bottom level */}
				<div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
					<p className="text-sm text-muted-foreground">
						{m.footer_rights({ year: currentYear })}
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
