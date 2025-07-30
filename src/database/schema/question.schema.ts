import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { quizzes } from "./quiz.schema";

// Question table schema
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  order: integer("order").notNull(), // For ordering questions in a quiz
  points: integer("points").default(1).notNull(), // Points for correct answer
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type inference for TypeScript
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
