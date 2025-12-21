import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/db";

export const betterAuthClient = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  baseURL: process.env.APP_URL || "http://localhost:3000",
  secret: process.env.AUTH_SECRET || "change-me-to-a-secret-key-in-production",
});
