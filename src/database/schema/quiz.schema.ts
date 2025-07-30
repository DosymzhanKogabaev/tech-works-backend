import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { users } from "./user.schema";

// Quiz table schema
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  coverImage: varchar("cover_image", { length: 500 }),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type inference for TypeScript
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
