import type { RequestContext } from "@remix-run/fetch-router";
import {
  userIdKey,
  userNameKey,
  userGithubUrlKey,
  userGithubUsernameKey,
} from "./auth-middleware";

export interface UserContext {
  userId: string | null;
  userName: string | null;
  githubUrl: string | null;
  githubUsername: string | null;
}

/**
 * Extract all user-related data from the request context storage.
 * This centralizes user data extraction and makes it easier to pass to components.
 */
export function getUserContext(context: RequestContext): UserContext {
  return {
    userId: context.storage.get(userIdKey),
    userName: context.storage.get(userNameKey),
    githubUrl: context.storage.get(userGithubUrlKey),
    githubUsername: context.storage.get(userGithubUsernameKey),
  };
}
