// Export all schemas
export * from "./user.schema";
export * from "./quiz.schema";
export * from "./question.schema";
export * from "./answer.schema";
export * from "./submission.schema";

// Re-export for convenience
import { users } from "./user.schema";
import { quizzes } from "./quiz.schema";
import { questions } from "./question.schema";
import { answers } from "./answer.schema";
import { submissions } from "./submission.schema";

// All tables for easy access
export const schema = {
  users,
  quizzes,
  questions,
  answers,
  submissions,
};
