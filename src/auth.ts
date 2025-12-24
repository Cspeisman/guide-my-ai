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
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  baseURL: process.env.APP_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.APP_URL || "http://localhost:3000",
    ...(process.env.TRUSTED_ORIGINS?.split(",") || []),
  ],
  secret: process.env.AUTH_SECRET || "change-me-to-a-secret-key-in-production",
});
