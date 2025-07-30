import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgEnum,
  serial,
} from "drizzle-orm/pg-core";

// Define user roles enum
export const roleEnum = pgEnum("role", ["user", "admin"]);

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: roleEnum("role").default("user").notNull(),
  score: integer("score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type inference for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = Omit<typeof users.$inferInsert, "id">;
