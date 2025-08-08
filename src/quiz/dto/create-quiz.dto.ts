import { IsString, IsOptional, MaxLength, MinLength } from "class-validator";

export class CreateQuizDto {
  @IsString()
  @MinLength(3, { message: "Title must be at least 3 characters long" })
  @MaxLength(255, { message: "Title must not exceed 255 characters" })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: "Description must not exceed 1000 characters" })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "Cover image URL must not exceed 500 characters" })
  coverImage?: string;
} 