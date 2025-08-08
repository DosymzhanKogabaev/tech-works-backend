import { IsObject, IsOptional, IsNumber, Min } from "class-validator";

export class SubmitQuizDto {
  @IsObject()
  answers: { [questionId: string]: number }; // questionId -> selectedAnswerId

  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Time spent cannot be negative" })
  timeSpent?: number; // Time in seconds
} 