import { Auth } from "better-auth";
import { betterAuthClient } from "../auth";
import { db } from "../db/db";

export interface OAuth2Error {
  error: string;
  error_description?: string;
}

export class AuthService {
  client: Auth["api"];
  constructor() {
    this.client = betterAuthClient.api;
  }
  /**
   * Handle login form submission for OAuth2 authorization
   */
  async signin(email: string, password: string) {
    // Authenticate user with Better Auth
    try {
      const result = await this.client.signInEmail({
        body: {
          email,
          password,
        },
        asResponse: true,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle signup form submission
   */
  async signup(name: string, email: string, password: string) {
    try {
      return await this.client.signUpEmail({
        body: {
          name,
          email,
          password,
        },
        asResponse: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async validateToken(token: string) {
    const userSession = await db.query.session.findFirst({
      where: (session, { eq }) => eq(session.token, token),
    });
    if (userSession) {
      return true;
    }
    return false;
  }

  async getSession(headers: Headers) {
    return await this.client.getSession({
      headers: headers,
    });
  }
}
