import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { questions } from "./question.schema";

// Answer table schema
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").default(false).notNull(),
  explanation: text("explanation"), // Optional explanation for the answer
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type inference for TypeScript
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
