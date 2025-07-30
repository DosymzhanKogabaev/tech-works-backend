import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { RegisterDto, LoginDto } from "./dto";
import { User } from "../database/schema";

export interface JwtPayload {
  sub: number; // user ID
  email: string;
  role: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    role: string;
    score: number;
  };
  access_token: string;
  refresh_token?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      // Create new user
      const user = await this.usersService.create({
        email: registerDto.email,
        password: registerDto.password,
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          score: user.score,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException("Failed to create user");
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        score: user.score,
      },
      ...tokens,
    };
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    const user = await this.usersService.findById(payload.sub);
    return user;
  }

  private async generateTokens(
    user: User
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: this.configService.get<string>("JWT_EXPIRES_IN", "1d"),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: this.configService.get<string>(
          "JWT_REFRESH_EXPIRES_IN",
          "7d"
        ),
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
