import { RiGlobalLine } from "@remixicon/react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/core/components/ui/select";
import * as m from "@/paraglide/messages.js";
import { getLocale, type Locale, setLocale } from "@/paraglide/runtime.js";

type LanguageSwitcherProps = {
	className?: string;
};

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
	const currentLocale = getLocale();
	const languages: Array<{ id: Locale; label: string }> = [
		{ id: "en", label: m.language_english() },
		{ id: "fr", label: m.language_french() },
	];

	return (
		<Select
			value={currentLocale}
			onValueChange={(value) => void setLocale(value as Locale)}
		>
			<SelectTrigger
				size="sm"
				aria-label={m.settings_language()}
				className={`w-[125px] cursor-pointer border-border bg-background transition-colors hover:bg-accent ${className}`}
			>
				<SelectValue placeholder={m.settings_language()} />
			</SelectTrigger>
			<SelectContent align="end">
				{languages.map((language) => (
					<SelectItem key={language.id} value={language.id} lang={language.id}>
						<RiGlobalLine className="size-4" />
						<span>{language.label}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
