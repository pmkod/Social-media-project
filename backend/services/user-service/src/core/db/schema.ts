import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const userProfiles = pgTable("user_profiles", {
	id: uuid("id").primaryKey(),
	userId: uuid("user_id").notNull().unique(),
	displayName: varchar("display_name", { length: 255 }),
	bio: text("bio"),
	avatarUrl: text("avatar_url"),
	location: varchar("location", { length: 255 }),
	website: varchar("website", { length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
