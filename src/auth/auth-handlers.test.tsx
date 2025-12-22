import { describe, it, expect } from "bun:test";
import { authHandlers } from "./auth-handlers";
describe("authHandlers", () => {
  describe("oauth", () => {
    it("should redirect to the redirectUrl with the token when successfully signed in", async () => {
      const authService = {
        async signin(emai: string, pw: string) {
          return {
            async json() {
              return { token: "my-test-token" };
            },
          };
        },
      };
      const handler = authHandlers(authService as any);
      const contextStub = {
        request: {
          url: "http://my-fake-url.com?redirect_uri=http://callback-url.com",
          async formData() {
            const map = new Map();
            map.set("email", "my-email@gmail.com");
            map.set("password", "my-password");
            return map;
          },
        },
      };
      const response = await handler.oauth.login.action(contextStub as any);
      const payload = await response.json();
      expect(payload.redirectUrl).toBe(
        "http://callback-url.com/?code=my-test-token"
      );
    });
  });

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
});
