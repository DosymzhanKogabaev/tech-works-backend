import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthService, AuthResponse } from "./auth.service";
import { RegisterDto, LoginDto } from "./dto";
import { Public, CurrentUser } from "./decorators";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { User } from "../database/schema";

@Controller("auth")
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Get("me")
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      score: user.score,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Get("verify")
  async verifyToken(@CurrentUser() user: User) {
    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
