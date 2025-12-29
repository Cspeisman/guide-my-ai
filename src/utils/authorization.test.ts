import { describe, it, expect } from "bun:test";
import {
  requireOwnership,
  canAccess,
  AuthorizationError,
  withOwnership,
  withOwnershipJson,
  type OwnedResource,
} from "./authorization";
import { AppStorage } from "@remix-run/fetch-router";
import { userIdKey } from "../auth/auth-middleware";

// Mock storage for testing
class MockStorage {
  private data = new Map();

  get(key: string) {
    return this.data.get(key);
  }

  set(key: string, value: any) {
    this.data.set(key, value);
  }
}

describe("authorization", () => {
  describe("requireOwnership", () => {
    it("allows access when user owns the resource", () => {
      const resource: OwnedResource = { userId: "user-123", id: "resource-1" };
      const userId = "user-123";

      expect(() => requireOwnership(resource, userId)).not.toThrow();
    });

    it("throws AuthorizationError when user does not own the resource", () => {
      const resource: OwnedResource = { userId: "user-123", id: "resource-1" };
      const userId = "user-456";

      expect(() => requireOwnership(resource, userId)).toThrow(
        AuthorizationError
      );
      expect(() => requireOwnership(resource, userId)).toThrow(
        "Forbidden: You don't have permission to access this resource"
      );
    });

    it("throws AuthorizationError when userId is null", () => {
      const resource: OwnedResource = { userId: "user-123", id: "resource-1" };
      const userId = null;

      expect(() => requireOwnership(resource, userId)).toThrow(
        AuthorizationError
      );
      expect(() => requireOwnership(resource, userId)).toThrow(
        "Unauthorized: No user ID provided"
      );
    });

    it("throws AuthorizationError when userId is undefined", () => {
      const resource: OwnedResource = { userId: "user-123", id: "resource-1" };
      const userId = undefined;

      expect(() => requireOwnership(resource, userId)).toThrow(
        AuthorizationError
      );
      expect(() => requireOwnership(resource, userId)).toThrow(
        "Unauthorized: No user ID provided"
      );
    });

    it("throws Error when resource is null", () => {
      const resource = null;
      const userId = "user-123";

      expect(() => requireOwnership(resource, userId)).toThrow(
        "Resource not found"
      );
    });

    it("throws Error when resource is undefined", () => {
      const resource = undefined;
      const userId = "user-123";

      expect(() => requireOwnership(resource, userId)).toThrow(
        "Resource not found"
      );
    });
  });

  describe("canAccess", () => {
    it("returns true when user owns the resource", () => {
      const resource: OwnedResource = { userId: "user-123", id: "resource-1" };
      const userId = "user-123";

      expect(canAccess(resource, userId)).toBe(true);
    });

    it("returns false when user does not own the resource", () => {
      const resource: OwnedResource = { userId: "user-123", id: "resource-1" };
      const userId = "user-456";

      expect(canAccess(resource, userId)).toBe(false);
    });

    it("returns false when userId is null", () => {
      const resource: OwnedResource = { userId: "user-123", id: "resource-1" };
      const userId = null;

      expect(canAccess(resource, userId)).toBe(false);
    });

    it("returns false when userId is undefined", () => {
      const resource: OwnedResource = { userId: "user-123", id: "resource-1" };
      const userId = undefined;

      expect(canAccess(resource, userId)).toBe(false);
    });

    it("returns false when resource is null", () => {
      const resource = null;
      const userId = "user-123";

      expect(canAccess(resource, userId)).toBe(false);
    });

    it("returns false when resource is undefined", () => {
      const resource = undefined;
      const userId = "user-123";

      expect(canAccess(resource, userId)).toBe(false);
    });

    it("returns false when both resource and userId are null", () => {
      const resource = null;
      const userId = null;

      expect(canAccess(resource, userId)).toBe(false);
    });
  });

  describe("AuthorizationError", () => {
    it("has correct name property", () => {
      const error = new AuthorizationError();
      expect(error.name).toBe("AuthorizationError");
    });

    it("has default message", () => {
      const error = new AuthorizationError();
      expect(error.message).toBe(
        "Forbidden: You don't have permission to access this resource"
      );
    });

    it("accepts custom message", () => {
      const error = new AuthorizationError("Custom error message");
      expect(error.message).toBe("Custom error message");
    });

    it("is instance of Error", () => {
      const error = new AuthorizationError();
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("withOwnership", () => {
    it("calls handler when user owns the resource", async () => {
      const resource: OwnedResource = { userId: "user-123", id: "resource-1" };
      const storage = new AppStorage();
      storage.set(userIdKey, "user-123");

      const context = { storage, params: { id: "resource-1" } };
      const fetchResource = async () => resource;
      const handler = async (ctx: any, res: OwnedResource) => {
        return new Response(JSON.stringify(res), { status: 200 });
      };

      const wrappedHandler = withOwnership(fetchResource, handler);
      const response = await wrappedHandler(context as any);

      expect(response.status).toBe(200);
    });

    it("returns 404 when resource does not exist", async () => {
      const storage = new AppStorage();
      storage.set(userIdKey, "user-123");

      const context = { storage, params: { id: "nonexistent" } };
      const fetchResource = async () => null;
      const handler = async () => new Response("OK");

      const wrappedHandler = withOwnership(fetchResource, handler);
      const response = await wrappedHandler(context as any);

      expect(response.status).toBe(404);
      const text = await response.text();
      expect(text).toBe("Not found");
    });

    it("returns 403 when user does not own the resource", async () => {
      const resource: OwnedResource = {
        userId: "other-user",
        id: "resource-1",
      };
      const storage = new AppStorage();
      storage.set(userIdKey, "user-123");

      const context = { storage, params: { id: "resource-1" } };
      const fetchResource = async () => resource;
      const handler = async () => new Response("OK");

      const wrappedHandler = withOwnership(fetchResource, handler);
      const response = await wrappedHandler(context as any);

      expect(response.status).toBe(403);
      const text = await response.text();
      expect(text).toContain("permission");
    });

    it("passes resource to handler", async () => {
      const resource: OwnedResource = {
        userId: "user-123",
        id: "resource-1",
        name: "Test Resource",
      };
      const storage = new AppStorage();
      storage.set(userIdKey, "user-123");

      const context = { storage, params: { id: "resource-1" } };
      const fetchResource = async () => resource;
      let receivedResource: any = null;
      const handler = async (ctx: any, res: OwnedResource) => {
        receivedResource = res;
        return new Response("OK");
      };

      const wrappedHandler = withOwnership(fetchResource, handler);
      await wrappedHandler(context as any);

      expect(receivedResource).toEqual(resource);
    });
  });

  describe("withOwnershipJson", () => {
    it("calls handler when user owns the resource", async () => {
      const resource: OwnedResource = { userId: "user-123", id: "resource-1" };
      const storage = new AppStorage();
      storage.set(userIdKey, "user-123");

      const context = { storage, params: { id: "resource-1" } };
      const fetchResource = async () => resource;
      const handler = async (ctx: any, res: OwnedResource) => {
        return Response.json(res);
      };

      const wrappedHandler = withOwnershipJson(fetchResource, handler);
      const response = await wrappedHandler(context as any);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.id).toBe("resource-1");
    });

    it("returns JSON 404 when resource does not exist", async () => {
      const storage = new AppStorage();
      storage.set(userIdKey, "user-123");

      const context = { storage, params: { id: "nonexistent" } };
      const fetchResource = async () => null;
      const handler = async () => Response.json({});

      const wrappedHandler = withOwnershipJson(fetchResource, handler);
      const response = await wrappedHandler(context as any);

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBe("Not found");
    });

    it("returns JSON 403 when user does not own the resource", async () => {
      const resource: OwnedResource = {
        userId: "other-user",
        id: "resource-1",
      };
      const storage = new AppStorage();
      storage.set(userIdKey, "user-123");

      const context = { storage, params: { id: "resource-1" } };
      const fetchResource = async () => resource;
      const handler = async () => Response.json({});

      const wrappedHandler = withOwnershipJson(fetchResource, handler);
      const response = await wrappedHandler(context as any);

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toContain("permission");
    });

    it("passes resource to handler", async () => {
      const resource: OwnedResource = {
        userId: "user-123",
        id: "resource-1",
        name: "Test Resource",
      };
      const storage = new AppStorage();
      storage.set(userIdKey, "user-123");

      const context = { storage, params: { id: "resource-1" } };
      const fetchResource = async () => resource;
      let receivedResource: any = null;
      const handler = async (ctx: any, res: OwnedResource) => {
        receivedResource = res;
        return Response.json({});
      };

      const wrappedHandler = withOwnershipJson(fetchResource, handler);
      await wrappedHandler(context as any);

      expect(receivedResource).toEqual(resource);
    });
  });
});
