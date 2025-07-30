import { pgTable, integer, timestamp, json, serial } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { quizzes } from "./quiz.schema";

// Submission table schema
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  timeSpent: integer("time_spent"), // Time in seconds
  answers: json("answers"), // Store user's answers as JSON
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type for storing user answers
export interface UserAnswers {
  [questionId: string]: string; // questionId -> selectedAnswerId
}

// Type inference for TypeScript
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
