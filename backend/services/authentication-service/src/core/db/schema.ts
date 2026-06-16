import { pgTable, uuid, varchar, boolean, timestamp, integer, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	username: varchar("username", { length: 50 }).notNull().unique(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	emailVerified: boolean("email_verified").notNull().default(false),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userVerifications = pgTable("user_verifications", {
	id: uuid("id").primaryKey(),
	userId: uuid("user_id").references(() => users.id),
	email: varchar("email", { length: 255 }).notNull(),
	fullName: varchar("full_name", { length: 255 }),
	passwordHash: varchar("password_hash", { length: 255 }),
	code: varchar("code", { length: 10 }).notNull(),
	token: varchar("token", { length: 255 }).notNull(),
	goal: varchar("goal", { length: 50 }).notNull(),
	numberOfFailedAttempts: integer("number_of_failed_attempts").notNull().default(0),
	numberOfCodeTransfersViaEmail: integer("number_of_code_transfers_via_email")
		.notNull()
		.default(0),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	verifiedAt: timestamp("verified_at", { withTimezone: true }),
	disabledAt: timestamp("disabled_at", { withTimezone: true }),
	goalAchievedAt: timestamp("goal_achieved_at", { withTimezone: true }),
});

export const refreshTokens = pgTable("refresh_tokens", {
	id: uuid("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	tokenHash: text("token_hash").notNull(),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	revokedAt: timestamp("revoked_at", { withTimezone: true }),
});
