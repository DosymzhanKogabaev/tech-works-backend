import { IsString, IsNumber, IsOptional, MinLength, Min } from "class-validator";

export class CreateQuestionDto {
  @IsString()
  @MinLength(5, { message: "Question text must be at least 5 characters long" })
  text: string;

  @IsNumber()
  @Min(1, { message: "Order must be at least 1" })
  order: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: "Points must be at least 1" })
  points?: number;
} 