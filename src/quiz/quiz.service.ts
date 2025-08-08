import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { eq, and, desc } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DATABASE_CONNECTION } from "../database/database.module";
import {
  quizzes,
  questions,
  answers,
  submissions,
  users,
  Quiz,
  Question,
  Answer,
  Submission,
  User,
} from "../database/schema";
import {
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuestionDto,
  CreateAnswerDto,
  SubmitQuizDto,
} from "./dto";

@Injectable()
export class QuizService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase<any>
  ) {}

  // QUIZ CRUD OPERATIONS
  async createQuiz(createQuizDto: CreateQuizDto, userId: number): Promise<Quiz> {
    const [quiz] = await this.db
      .insert(quizzes)
      .values({
        ...createQuizDto,
        createdBy: userId,
      })
      .returning();

    return quiz;
  }

  async findAllQuizzes(isPublished?: boolean): Promise<Quiz[]> {
    const query = this.db.select().from(quizzes);
    
    if (isPublished !== undefined) {
      query.where(eq(quizzes.isPublished, isPublished));
    }
    
    return await query.orderBy(desc(quizzes.createdAt));
  }

  async findQuizById(id: number): Promise<Quiz> {
    const [quiz] = await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))
      .limit(1);

    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }

    return quiz;
  }

  async findQuizWithQuestions(id: number): Promise<Quiz & { questions: (Question & { answers: Answer[] })[] }> {
    const quiz = await this.findQuizById(id);

    const quizQuestions = await this.db
      .select()
      .from(questions)
      .where(eq(questions.quizId, id))
      .orderBy(questions.order);

    const questionsWithAnswers = await Promise.all(
      quizQuestions.map(async (question) => {
        const questionAnswers = await this.db
          .select()
          .from(answers)
          .where(eq(answers.questionId, question.id));

        return {
          ...question,
          answers: questionAnswers,
        };
      })
    );

    return {
      ...quiz,
      questions: questionsWithAnswers,
    };
  }

  async updateQuiz(id: number, updateQuizDto: UpdateQuizDto, userId: number): Promise<Quiz> {
    const quiz = await this.findQuizById(id);

    if (quiz.createdBy !== userId) {
      throw new ForbiddenException("You can only update your own quizzes");
    }

    const [updatedQuiz] = await this.db
      .update(quizzes)
      .set({
        ...updateQuizDto,
        updatedAt: new Date(),
      })
      .where(eq(quizzes.id, id))
      .returning();

    return updatedQuiz;
  }

  async deleteQuiz(id: number, userId: number): Promise<void> {
    const quiz = await this.findQuizById(id);

    if (quiz.createdBy !== userId) {
      throw new ForbiddenException("You can only delete your own quizzes");
    }

    await this.db.delete(quizzes).where(eq(quizzes.id, id));
  }

  // QUESTION MANAGEMENT
  async addQuestion(quizId: number, createQuestionDto: CreateQuestionDto, userId: number): Promise<Question> {
    const quiz = await this.findQuizById(quizId);

    if (quiz.createdBy !== userId) {
      throw new ForbiddenException("You can only add questions to your own quizzes");
    }

    const [question] = await this.db
      .insert(questions)
      .values({
        ...createQuestionDto,
        quizId,
      })
      .returning();

    return question;
  }

  async addAnswer(questionId: number, createAnswerDto: CreateAnswerDto, userId: number): Promise<Answer> {
    // Check if question exists and user owns the quiz
    const [question] = await this.db
      .select({
        question: questions,
        quiz: quizzes,
      })
      .from(questions)
      .leftJoin(quizzes, eq(questions.quizId, quizzes.id))
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!question) {
      throw new NotFoundException("Question not found");
    }

    if (question.quiz.createdBy !== userId) {
      throw new ForbiddenException("You can only add answers to your own quiz questions");
    }

    const [answer] = await this.db
      .insert(answers)
      .values({
        ...createAnswerDto,
        questionId,
      })
      .returning();

    return answer;
  }

  // QUIZ TAKING & SUBMISSION
  async submitQuiz(quizId: number, submitQuizDto: SubmitQuizDto, userId: number): Promise<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    submission: Submission;
  }> {
    const quizWithQuestions = await this.findQuizWithQuestions(quizId);

    if (!quizWithQuestions.isPublished) {
      throw new BadRequestException("Quiz is not published yet");
    }

    // Calculate score
    let correctAnswers = 0;
    let totalScore = 0;

    for (const question of quizWithQuestions.questions) {
      const userAnswerId = submitQuizDto.answers[question.id.toString()];
      
      if (userAnswerId) {
        const selectedAnswer = question.answers.find(answer => answer.id === userAnswerId);
        if (selectedAnswer && selectedAnswer.isCorrect) {
          correctAnswers++;
          totalScore += question.points;
        }
      }
    }

    // Save submission
    const [submission] = await this.db
      .insert(submissions)
      .values({
        userId,
        quizId,
        score: totalScore,
        totalQuestions: quizWithQuestions.questions.length,
        correctAnswers,
        timeSpent: submitQuizDto.timeSpent,
        answers: submitQuizDto.answers,
      })
      .returning();

    // Update user score
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user) {
      await this.db
        .update(users)
        .set({
          score: user.score + totalScore,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    return {
      score: totalScore,
      totalQuestions: quizWithQuestions.questions.length,
      correctAnswers,
      submission,
    };
  }

  // STATISTICS
  async getUserSubmissions(userId: number): Promise<Submission[]> {
    return await this.db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.completedAt));
  }

  async getQuizLeaderboard(quizId: number, limit: number = 10): Promise<any[]> {
    const leaderboard = await this.db
      .select({
        userId: submissions.userId,
        score: submissions.score,
        completedAt: submissions.completedAt,
        userEmail: users.email,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.userId, users.id))
      .where(eq(submissions.quizId, quizId))
      .orderBy(desc(submissions.score))
      .limit(limit);

    return leaderboard;
  }

  async getGlobalLeaderboard(limit: number = 10): Promise<any[]> {
    const leaderboard = await this.db
      .select({
        userId: users.id,
        email: users.email,
        totalScore: users.score,
      })
      .from(users)
      .orderBy(desc(users.score))
      .limit(limit);

    return leaderboard;
  }
} 