import { describe, expect, test } from "bun:test";
import {
	buildMessageMediaResponse,
	type MessageMediaDetails,
} from "./messages.service";

const createMedia = (
	overrides: Partial<MessageMediaDetails> = {},
): MessageMediaDetails => ({
	id: "image-id",
	type: "IMAGE",
	url: null,
	fileName: "photo.jpg",
	mimeType: "image/jpeg",
	position: 1,
	lowQualityFileName: "private/low.webp",
	highQualityFileName: "private/high.jpg",
	width: null,
	height: null,
	...overrides,
});

describe("message media response", () => {
	test("exposes protected API routes without leaking storage object keys", () => {
		const response = buildMessageMediaResponse(createMedia(), "message-id");

		expect(response.url).toBe(
			"/chat/get-message-image/message-id/image-id/low",
		);
		expect(response.lowQualityUrl).toBe(
			"/chat/get-message-image/message-id/image-id/low",
		);
		expect(response.highQualityUrl).toBe(
			"/chat/get-message-image/message-id/image-id/high",
		);
		expect(JSON.stringify(response)).not.toContain("private/low.webp");
		expect(JSON.stringify(response)).not.toContain("private/high.jpg");
	});

	test("keeps legacy external media readable", () => {
		const legacyUrl = "https://cdn.example.test/legacy.jpg";
		const response = buildMessageMediaResponse(
			createMedia({
				url: legacyUrl,
				lowQualityFileName: null,
				highQualityFileName: null,
			}),
			"message-id",
		);

		expect(response.url).toBe(legacyUrl);
		expect(response.lowQualityUrl).toBe(legacyUrl);
		expect(response.highQualityUrl).toBe(legacyUrl);
	});
});
