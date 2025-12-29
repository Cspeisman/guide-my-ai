/**
 * Authorization utilities for checking resource ownership
 */

import type { RequestContext, RequestMethod } from "@remix-run/fetch-router";
import { userIdKey } from "../auth/auth-middleware";

export interface OwnedResource {
  userId: string;
  [key: string]: any;
}

export class AuthorizationError extends Error {
  constructor(
    message: string = "Forbidden: You don't have permission to access this resource"
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Checks if a user owns a resource
 * @throws {AuthorizationError} if the user doesn't own the resource
 */
export function requireOwnership(
  resource: OwnedResource | null | undefined,
  userId: string | null | undefined
): asserts resource is OwnedResource {
  if (!resource) {
    throw new Error("Resource not found");
  }

  if (!userId) {
    throw new AuthorizationError("Unauthorized: No user ID provided");
  }

  if (resource.userId !== userId) {
    throw new AuthorizationError();
  }
}

/**
 * Checks if a user owns a resource (returns boolean)
 */
export function canAccess(
  resource: OwnedResource | null | undefined,
  userId: string | null | undefined
): boolean {
  if (!resource || !userId) {
    return false;
  }

  return resource.userId === userId;
}

/**
 * Higher-order function that wraps a handler with ownership authorization
 *
 * @example
 * ```typescript
 * const show = withOwnership(
 *   async (context) => repository.getById(context.params.id),
 *   async (context, resource) => {
 *     return render(<ShowView resource={resource} />);
 *   }
 * );
 * ```
 */
export function withOwnership<TResource extends OwnedResource>(
  fetchResource: (
    context: RequestContext<RequestMethod, { id?: string }>
  ) => Promise<TResource | null>,
  handler: (context: RequestContext, resource: TResource) => Promise<Response>
) {
  return async (context: RequestContext) => {
    // Extract userId from context storage
    const userId = context.storage?.get?.(userIdKey);

    // Fetch the resource
    const resource = await fetchResource(context);

    // Check if resource exists
    if (!resource) {
      return new Response("Not found", { status: 404 });
    }

    // Check ownership
    try {
      requireOwnership(resource, userId);
    } catch (error: any) {
      if (error.name === "AuthorizationError") {
        return new Response(error.message, { status: 403 });
      }
      throw error;
    }

    // Call the actual handler with the verified resource
    return handler(context, resource);
  };
}

export function withOwnershipJson<TResource extends OwnedResource>(
  fetchResource: (
    context: RequestContext<RequestMethod, { id?: string }>
  ) => Promise<TResource | null>,
  handler: (context: RequestContext, resource: TResource) => Promise<Response>
) {
  return async (context: RequestContext) => {
    // Extract userId from context storage
    const userId = context.storage?.get?.(userIdKey);

    // Fetch the resource
    const resource = await fetchResource(context);

    // Check if resource exists
    if (!resource) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    // Check ownership
    try {
      requireOwnership(resource, userId);
    } catch (error: any) {
      if (error.name === "AuthorizationError") {
        return Response.json({ error: error.message }, { status: 403 });
      }
      throw error;
    }

    // Call the actual handler with the verified resource
    return handler(context, resource);
  };
}
