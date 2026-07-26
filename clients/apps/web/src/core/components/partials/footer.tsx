import { Github } from "lucide-react";
import { Logo } from "./logo";

interface FooterGroupProps {
	title: string;
	children: React.ReactNode;
}

export function FooterGroup({ title, children }: FooterGroupProps) {
	return (
		<div>
			<FooterGroupTitle>{title}</FooterGroupTitle>
			{children}
		</div>
	);
}

export function FooterGroupTitle({ children }: { children: React.ReactNode }) {
	return (
		<h3 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">
			{children}
		</h3>
	);
}

export function FooterGroupList({ children }: { children: React.ReactNode }) {
	return <ul className="space-y-2">{children}</ul>;
}

interface FooterItemProps {
	href: string;
	children: React.ReactNode;
}

export function FooterItem({ href, children }: FooterItemProps) {
	return (
		<li>
			<a
				href={href}
				className="text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition-colors"
			>
				{children}
			</a>
		</li>
	);
}

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="site-footer">
			<div className="page-wrap py-12">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
					{/* Brand */}
					<div className="lg:col-span-2">
						<Logo />
						<p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--sea-ink-soft)]">
							Graphy empowers teams to transform raw data into clear, compelling
							visuals — making insights easier to share, understand, and act on.
						</p>
						<div className="mt-5 flex items-center gap-4">
							<a
								href="https://github.com"
								target="_blank"
								rel="noopener noreferrer"
								className="text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition-colors"
								aria-label="GitHub"
							>
								<Github size={20} />
							</a>
						</div>
					</div>

					{/* Product */}
					<FooterGroup title="Product">
						<FooterGroupList>
							<FooterItem href="#">Features</FooterItem>
							<FooterItem href="#">Pricing</FooterItem>
							<FooterItem href="#">Integrations</FooterItem>
							<FooterItem href="#">Changelog</FooterItem>
						</FooterGroupList>
					</FooterGroup>

					{/* Resources */}
					<FooterGroup title="Resources">
						<FooterGroupList>
							<FooterItem href="#">Documentation</FooterItem>
							<FooterItem href="#">Tutorials</FooterItem>
							<FooterItem href="#">Blog</FooterItem>
							<FooterItem href="#">Support</FooterItem>
						</FooterGroupList>
					</FooterGroup>

					{/* Company */}
					<FooterGroup title="Company">
						<FooterGroupList>
							<FooterItem href="#">About</FooterItem>
							<FooterItem href="#">Careers</FooterItem>
							<FooterItem href="#">Contact</FooterItem>
							<FooterItem href="#">Partners</FooterItem>
						</FooterGroupList>
					</FooterGroup>
				</div>
			</div>

			{/* Bottom bar */}
			<div className="border-t border-[var(--line)]">
				<div className="page-wrap flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
					<p className="text-sm text-[var(--sea-ink-soft)]">
						© {currentYear} Graphy. All rights reserved.
					</p>
					<div className="flex items-center gap-6">
						<a
							href="/privacy-policy"
							className="text-sm text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)] transition-colors"
						>
							Privacy Policy
						</a>
						<a
							href="/terms-of-service"
							className="text-sm text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)] transition-colors"
						>
							Terms of Service
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
