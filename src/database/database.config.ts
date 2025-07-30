import { ConfigService } from "@nestjs/config";

export const getDatabaseConfig = (configService: ConfigService) => ({
  host: configService.get<string>("DB_HOST", "localhost"),
  port: configService.get<number>("DB_PORT", 5432),
  user: configService.get<string>("DB_USER", "postgres"),
  password: configService.get<string>("DB_PASSWORD"),
  database: configService.get<string>("DB_NAME", "tech-works"),
  ssl:
    configService.get<string>("NODE_ENV") === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const getDatabaseUrl = (configService: ConfigService): string => {
  const dbUrl = configService.get<string>("DATABASE_URL");
  if (dbUrl) {
    return dbUrl;
  }

  const config = getDatabaseConfig(configService);
  return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
};
