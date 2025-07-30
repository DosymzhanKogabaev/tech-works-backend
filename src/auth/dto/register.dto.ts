import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @MaxLength(100, { message: "Password must not exceed 100 characters" })
  password: string;

  @IsOptional()
  @IsString()
  role?: "user" | "admin";
}
