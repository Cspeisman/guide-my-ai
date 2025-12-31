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
      mapProfileToUser: (profile) => {
        return {
          githubUsername: profile.login,
          githubUrl: profile.html_url,
        };
      },
    },
  },
  user: {
    additionalFields: {
      githubUsername: {
        type: "string",
        required: false,
      },
      githubUrl: {
        type: "string",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Normalize username (name field) to lowercase and replace spaces with hyphens
          return {
            data: {
              ...user,
              name: user.name.toLowerCase().replace(/\s+/g, "-"),
            },
          };
        },
      },
    },
  },
  baseURL: process.env.APP_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.APP_URL || "http://localhost:3000",
    ...(process.env.TRUSTED_ORIGINS?.split(",") || []),
  ],
  secret: process.env.AUTH_SECRET || "change-me-to-a-secret-key-in-production",
});
