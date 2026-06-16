import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
	id: uuid("id").primaryKey(),
	authorId: uuid("author_id").notNull(),
	content: text("content").notNull(),
	mediaUrls: text("media_urls").array(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const comments = pgTable("comments", {
	id: uuid("id").primaryKey(),
	postId: uuid("post_id")
		.notNull()
		.references(() => posts.id),
	authorId: uuid("author_id").notNull(),
	content: text("content").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const postLikes = pgTable(
	"post_likes",
	{
		id: uuid("id").primaryKey(),
		postId: uuid("post_id")
			.notNull()
			.references(() => posts.id),
		authorId: uuid("author_id").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => ({
		uniqueLike: uniqueIndex("post_likes_unique_idx").on(table.postId, table.authorId),
	}),
);

export const commentLikes = pgTable(
	"comment_likes",
	{
		id: uuid("id").primaryKey(),
		commentId: uuid("comment_id")
			.notNull()
			.references(() => comments.id),
		authorId: uuid("author_id").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => ({
		uniqueLike: uniqueIndex("comment_likes_unique_idx").on(table.commentId, table.authorId),
	}),
);
