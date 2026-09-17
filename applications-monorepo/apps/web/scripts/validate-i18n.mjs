import { readdir, readFile } from "node:fs/promises";

const messagesDirectory = new URL("../messages/", import.meta.url);
const settingsUrl = new URL(
	"../project.inlang/settings.json",
	import.meta.url,
);
const settings = JSON.parse(await readFile(settingsUrl, "utf8"));
const locales = settings.locales;
const baseLocale = settings.baseLocale;
const domainEntries = await readdir(messagesDirectory, { withFileTypes: true });
const domains = domainEntries
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name)
	.sort();
const errors = [];
const globalKeysByLocale = new Map(
	locales.map((locale) => [locale, new Map()]),
);
let messageCount = 0;

for (const domain of domains) {
	const keysByLocale = new Map();

	for (const locale of locales) {
		const catalogUrl = new URL(`${domain}/${locale}.json`, messagesDirectory);
		let catalog;
		try {
			catalog = JSON.parse(await readFile(catalogUrl, "utf8"));
		} catch (error) {
			errors.push(
				`Unable to read messages/${domain}/${locale}.json: ${error.message}`,
			);
			continue;
		}

		const keys = Object.keys(catalog).filter((key) => key !== "$schema");
		keysByLocale.set(locale, new Set(keys));
		if (locale === baseLocale) messageCount += keys.length;

		for (const key of keys) {
			const globalKeys = globalKeysByLocale.get(locale);
			const previousDomain = globalKeys.get(key);
			if (previousDomain) {
				errors.push(
					`Duplicate key "${key}" in ${previousDomain}/${locale}.json and ${domain}/${locale}.json.`,
				);
			} else {
				globalKeys.set(key, domain);
			}
		}
	}

	const baseKeys = keysByLocale.get(baseLocale);
	if (!baseKeys) continue;

	for (const locale of locales) {
		if (locale === baseLocale) continue;
		const localeKeys = keysByLocale.get(locale);
		if (!localeKeys) continue;

		for (const key of baseKeys) {
			if (!localeKeys.has(key)) {
				errors.push(`Missing key "${key}" in ${domain}/${locale}.json.`);
			}
		}
		for (const key of localeKeys) {
			if (!baseKeys.has(key)) {
				errors.push(
					`Key "${key}" exists in ${domain}/${locale}.json but not in the base locale.`,
				);
			}
		}
	}
}

if (errors.length > 0) {
	throw new Error(`Invalid translation catalogs:\n- ${errors.join("\n- ")}`);
}

console.log(
	`Validated ${messageCount} messages across ${domains.length} domains and ${locales.length} locales.`,
);
