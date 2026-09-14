import { HTTPError } from "ky";
import { afterEach, describe, expect, it } from "vitest";
import { overwriteGetLocale } from "@/paraglide/runtime.js";
import {
	getExceptionMessage,
	translateExceptionCode,
} from "./translate-exception-code.ts";

afterEach(() => overwriteGetLocale(() => "en"));

describe("translateExceptionCode", () => {
	it("translates a known exception code using the active locale", () => {
		overwriteGetLocale(() => "fr");

		expect(translateExceptionCode("incorrect_email_or_password")).toBe(
			"Adresse e-mail ou mot de passe incorrect.",
		);
	});

	it("uses the localized fallback for an unknown code", () => {
		overwriteGetLocale(() => "en");
		expect(translateExceptionCode("unknown_code")).toBe("Something went wrong");

		overwriteGetLocale(() => "fr");
		expect(translateExceptionCode(undefined)).toBe("Une erreur est survenue");
	});

	it("uses the localized fallback for a non-HTTP error", () => {
		overwriteGetLocale(() => "fr");

		expect(getExceptionMessage(new Error("Network error"))).toBe(
			"Une erreur est survenue",
		);
	});

	it("reads the code from the backend error contract", () => {
		const error = new HTTPError(
			new Response(null, { status: 400 }),
			new Request("https://example.com/login"),
			{} as never,
		);
		error.data = {
			error: {
				message: "Incorrect email or password",
				code: "incorrect_email_or_password",
			},
		};
		overwriteGetLocale(() => "fr");

		expect(getExceptionMessage(error)).toBe(
			"Adresse e-mail ou mot de passe incorrect.",
		);
	});
});
