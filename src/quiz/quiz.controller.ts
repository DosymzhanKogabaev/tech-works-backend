import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { QuizService } from "./quiz.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser, Public } from "../auth/decorators";
import { User } from "../database/schema";
import {
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuestionDto,
  CreateAnswerDto,
  SubmitQuizDto,
} from "./dto";

@Controller("quiz")
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // QUIZ MANAGEMENT ENDPOINTS
  @Post()
  async createQuiz(
    @Body() createQuizDto: CreateQuizDto,
    @CurrentUser() user: User
  ) {
    return this.quizService.createQuiz(createQuizDto, user.id);
  }

  @Public()
  @Get()
  async findAllQuizzes(@Query("published") published?: string) {
    const isPublished = published === "true" ? true : published === "false" ? false : undefined;
    return this.quizService.findAllQuizzes(isPublished);
  }

  @Public()
  @Get(":id")
  async findOneQuiz(@Param("id", ParseIntPipe) id: number) {
    return this.quizService.findQuizById(id);
  }

  @Public()
  @Get(":id/full")
  async findQuizWithQuestions(@Param("id", ParseIntPipe) id: number) {
    return this.quizService.findQuizWithQuestions(id);
  }

  @Patch(":id")
  async updateQuiz(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizDto,
    @CurrentUser() user: User
  ) {
    return this.quizService.updateQuiz(id, updateQuizDto, user.id);
  }

  @Delete(":id")
  async deleteQuiz(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    await this.quizService.deleteQuiz(id, user.id);
    return { message: "Quiz deleted successfully" };
  }

  // QUESTION MANAGEMENT ENDPOINTS
  @Post(":quizId/questions")
  async addQuestion(
    @Param("quizId", ParseIntPipe) quizId: number,
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser() user: User
  ) {
    return this.quizService.addQuestion(quizId, createQuestionDto, user.id);
  }

  @Post("questions/:questionId/answers")
  async addAnswer(
    @Param("questionId", ParseIntPipe) questionId: number,
    @Body() createAnswerDto: CreateAnswerDto,
    @CurrentUser() user: User
  ) {
    return this.quizService.addAnswer(questionId, createAnswerDto, user.id);
  }

  // QUIZ TAKING ENDPOINTS
  @Post(":id/submit")
  async submitQuiz(
    @Param("id", ParseIntPipe) id: number,
    @Body() submitQuizDto: SubmitQuizDto,
    @CurrentUser() user: User
  ) {
    return this.quizService.submitQuiz(id, submitQuizDto, user.id);
  }

  // STATISTICS ENDPOINTS
  @Get("user/submissions")
  async getUserSubmissions(@CurrentUser() user: User) {
    return this.quizService.getUserSubmissions(user.id);
  }

  @Public()
  @Get(":id/leaderboard")
  async getQuizLeaderboard(
    @Param("id", ParseIntPipe) id: number,
    @Query("limit") limit?: string
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.quizService.getQuizLeaderboard(id, limitNumber);
  }

  @Public()
  @Get("leaderboard/global")
  async getGlobalLeaderboard(@Query("limit") limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.quizService.getGlobalLeaderboard(limitNumber);
  }
} 