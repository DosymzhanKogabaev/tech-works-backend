import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Welcome to TechWorks Quiz Platform Backend! 🎯";
  }
}
