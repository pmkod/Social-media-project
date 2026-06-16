import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
	id: uuid("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull().unique(),
	description: varchar("description", { length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const permissions = pgTable("permissions", {
	id: uuid("id").primaryKey(),
	resource: varchar("resource", { length: 100 }).notNull(),
	action: varchar("action", { length: 100 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rolePermissions = pgTable("role_permissions", {
	id: uuid("id").primaryKey(),
	roleId: uuid("role_id")
		.notNull()
		.references(() => roles.id),
	permissionId: uuid("permission_id")
		.notNull()
		.references(() => permissions.id),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userRoles = pgTable("user_roles", {
	id: uuid("id").primaryKey(),
	userId: uuid("user_id").notNull(),
	roleId: uuid("role_id")
		.notNull()
		.references(() => roles.id),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
