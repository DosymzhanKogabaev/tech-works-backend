import { IsString, IsBoolean, IsOptional, MinLength } from "class-validator";

export class CreateAnswerDto {
  @IsString()
  @MinLength(1, { message: "Answer text is required" })
  text: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsOptional()
  @IsString()
  explanation?: string;
} 