import type { Middleware } from "@remix-run/fetch-router";
import { createStorageKey } from "@remix-run/fetch-router";
import { betterAuthClient } from "../auth";
import { RequestValidator } from "../utils/request-validator";
import { routes } from "../routes";
import { db } from "../db/db";
import { user } from "./db-schema";
import { eq } from "drizzle-orm";
// Create storage keys for auth data
export const userIdKey = createStorageKey<string | null>();
export const userNameKey = createStorageKey<string | null>();
export const betterAuthSessionKey = createStorageKey<any>();

/**
 * Creates middleware to check authorization for API routes
 * Supports both OAuth2 Bearer tokens and Better Auth sessions
 */
export function createApiAuthMiddleware(): Middleware {
  return async (context, next) => {
    context.storage.set(userIdKey, null);
    context.storage.set(userNameKey, null);

    // Allow static assets and auth routes without authentication
    if (
      [
        routes.auth.signup.index.href(),
        routes.auth.login.index.href(),
      ].includes(context.url.pathname) ||
      context.url.pathname.startsWith("/css/") ||
      context.url.pathname.startsWith("/js/")
    ) {
      return next();
    }

    let userId: string | null = null;

    // Try bearer token authentication first
    const authHeader = context.request.headers.get("authorization");
    const bearerToken = RequestValidator.extractBearerToken(authHeader);

    if (bearerToken) {
      const userSession = await db.query.session.findFirst({
        where: (session, { eq }) => eq(session.token, bearerToken),
      });
      if (userSession) {
        userId = userSession.userId;
      }
    }

    // Fall back to Better Auth session if no bearer token auth
    if (!userId) {
      try {
        const session = await betterAuthClient.api.getSession({
          headers: context.request.headers,
        });

        if (session) {
          userId = session.user.id;
          context.storage.set(betterAuthSessionKey, session);
        }
      } catch (error) {
        // Invalid session, continue without user
      }
    }

    // Set userId and userName if we found a user
    if (userId) {
      context.storage.set(userIdKey, userId);
      
      // Fetch user details to get the name
      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, userId),
      });
      
      if (userRecord) {
        context.storage.set(userNameKey, userRecord.name);
      }
    }

    // Allow home route even without authentication
    if (context.url.pathname === routes.home.href()) {
      return next();
    }

    // Require authentication for all other routes
    if (!userId) {
      return Response.json(
        {
          error: "unauthorized",
          message: "No valid session or token found",
        },
        { status: 401 }
      );
    }

    return next();
  };
}
