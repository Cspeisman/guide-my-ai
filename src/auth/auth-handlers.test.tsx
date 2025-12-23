import { describe, it, expect } from "bun:test";
import { authHandlers } from "./auth-handlers";
describe("authHandlers", () => {
  describe("validateToken", () => {
    it("should return isValid true when token is valid", async () => {
      const authService = {
        async validateToken(token: string) {
          return true;
        },
      };
      const handler = authHandlers(authService as any);
      const contextStub = {
        request: {
          async json() {
            return { token: "valid-token" };
          },
        },
      };
      const response = await handler.auth.api.validateToken(contextStub as any);
      const payload = await response.json();
      expect(payload.isValid).toBe(true);
    });

    it("should return isValid false when token is invalid", async () => {
      const authService = {
        async validateToken(token: string) {
          return false;
        },
      };
      const handler = authHandlers(authService as any);
      const contextStub = {
        request: {
          async json() {
            return { token: "invalid-token" };
          },
        },
      };
      const response = await handler.auth.api.validateToken(contextStub as any);
      const payload = await response.json();
      expect(payload.isValid).toBe(false);
    });
  });

  describe("callback", () => {
    it("should redirect to home when redirect_uri is not present", async () => {
      const authService = {
        async getSession(headers: Headers) {
          return {
            session: { token: "test-token" },
          };
        },
      };
      const handler = authHandlers(authService as any);
      const contextStub = {
        request: {
          url: "http://my-fake-url.com/auth/callback",
          headers: new Headers(),
        },
      };
      const response = await handler.auth.callback(contextStub as any);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/");
    });

    it("should redirect to redirect_uri with token when redirect_uri is present", async () => {
      const authService = {
        async getSession(headers: Headers) {
          return {
            session: { token: "test-session-token" },
          };
        },
      };
      const handler = authHandlers(authService as any);
      const contextStub = {
        request: {
          url: "http://my-fake-url.com/auth/callback?redirect_uri=http://callback-url.com",
          headers: new Headers(),
        },
      };
      const response = await handler.auth.callback(contextStub as any);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe(
        "http://callback-url.com/?token=test-session-token"
      );
    });
  });
});
