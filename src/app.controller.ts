import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./auth/decorators";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get("health")
  getHealth() {
    return {
      status: "ok",
      message: "TechWorks Quiz Backend is running!",
      timestamp: new Date().toISOString(),
    };
  }
}
