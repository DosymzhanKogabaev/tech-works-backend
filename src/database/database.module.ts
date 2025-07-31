import { Module, Global } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { getDatabaseUrl } from "./database.config";
import { schema } from "./schema";

const postgres = require("postgres");

// Database connection token
export const DATABASE_CONNECTION = "DATABASE_CONNECTION";

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = getDatabaseUrl(configService);

        // Create PostgreSQL connection
        const client = postgres(databaseUrl, {
          max: 10, // Maximum number of connections
          idle_timeout: 20,
          connect_timeout: 10,
        });

        // Return DrizzleORM instance with schema
        return drizzle(client, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
