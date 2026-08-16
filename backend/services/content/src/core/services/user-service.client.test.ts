import { describe, expect, it } from "bun:test";
import { UserServiceClient } from "./user-service.client";

describe("UserServiceClient", () => {

	it("should return empty map for empty userIds array without making network calls", async () => {
		const client = new UserServiceClient(
			"http://invalid-url-that-does-not-exist",
		);
		const map = await client.fetchAuthorsBatch([]);
		expect(map.size).toBe(0);
	});

	it("should handle network failure gracefully without throwing", async () => {
		const client = new UserServiceClient("http://127.0.0.1:59999");
		const map = await client.fetchAuthorsBatch(["user-xyz"]);
		expect(map.size).toBe(0);
	});
});
