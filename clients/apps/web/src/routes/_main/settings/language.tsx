import { RiCheckLine, RiGlobalLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { cn } from "@/core/lib/utils.ts";
import { m } from "@/paraglide/messages.js";
import { getLocale, type Locale, setLocale } from "@/paraglide/runtime.js";

export const Route = createFileRoute("/_main/settings/language")({
	component: LanguageSettingsPage,
});

function LanguageSettingsPage() {
	const currentLocale = getLocale();
	const languages: Array<{ id: Locale; label: string }> = [
		{ id: "en", label: m.language_english() },
		{ id: "fr", label: m.language_french() },
	];

	return (
		<>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/settings" />
					<AppHeaderTitle>{m.settings_language()}</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div>
				<p className="mb-3 text-sm text-muted-foreground">
					{m.language_display()}
				</p>
				<div className="grid gap-3 sm:grid-cols-2">
					{languages.map((language) => {
						const isSelected = language.id === currentLocale;
						return (
							<button
								type="button"
								key={language.id}
								lang={language.id}
								aria-pressed={isSelected}
								onClick={() => void setLocale(language.id)}
								className={cn(
									"flex cursor-pointer items-center gap-3 rounded bg-accent px-4 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
									isSelected ? "bg-primary/10 text-primary" : "hover:bg-accent",
								)}
							>
								<RiGlobalLine className="size-5" />
								<span className="flex-1 font-medium">{language.label}</span>
								{isSelected ? <RiCheckLine className="size-5" /> : null}
							</button>
						);
					})}
				</div>
			</div>
		</>
	);
}
