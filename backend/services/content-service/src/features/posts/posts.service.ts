import { uuidv7 } from "uuidv7";
import { db } from "@/core/db";
import { posts } from "@/core/db/schema";

export async function createPost(input: { authorId: string; content: string; mediaUrls?: string[] }) {
	const post = await db
		.insert(posts)
		.values({
			id: uuidv7(),
			authorId: input.authorId,
			content: input.content,
			mediaUrls: input.mediaUrls ?? [],
		})
		.returning();

	return post[0];
}
