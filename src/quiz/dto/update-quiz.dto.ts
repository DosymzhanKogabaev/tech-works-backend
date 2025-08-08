import { PartialType } from "@nestjs/mapped-types";
import { IsOptional, IsBoolean } from "class-validator";
import { CreateQuizDto } from "./create-quiz.dto";

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
} 