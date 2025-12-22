import { render } from "../utils";
import { RequestValidator } from "../utils/request-validator";
import { AuthService } from "./auth-service";
import { UnauthedLayout } from "../layouts/UnauthedLayout";
import React from "react";
import { routes } from "../routes";
import { Controller } from "@remix-run/fetch-router";

const authService = new AuthService();

export const authHandlers = {
  auth: {
    signup: {
      index() {
        return render(
          <UnauthedLayout
            assets={{ scripts: [routes.js.href({ path: "signup" })] }}
          >
            <div id="root"></div>
          </UnauthedLayout>
        );
      },
      async action({ request }: { request: Request }) {
        const formData = await request.formData();
        const name = formData.get("name");
        const email = formData.get("email");
        const password = formData.get("password");
        if (!name || !email || !password) {
          return Response.error();
        }
        await authService.signup(
          name.toString(),
          email.toString(),
          password.toString()
        );
        return Response.redirect(routes.auth.login.index.href(), 302);
      },
    },
    login: {
      index() {
        return render(
          <UnauthedLayout
            assets={{ scripts: [routes.js.href({ path: "login" })] }}
          >
            <div id="root"></div>
          </UnauthedLayout>
        );
      },
      async action({ request }: { request: Request }) {
        const formData = await request.formData();
        const email = formData.get("email");
        const password = formData.get("password");
        if (!email || !password) {
          return Response.error();
        }
        return await authService.signin(
          (email ?? "").toString(),
          (password ?? "").toString()
        );
      },
    },
    async logout({ request }: { request: Request }) {
      // Call Better Auth's sign-out endpoint
      const signOutResponse = await fetch(
        new URL("/api/auth/sign-out", request.url).toString(),
        {
          method: "POST",
          headers: request.headers,
        }
      );

      // Create a redirect response to home
      const redirectResponse = Response.redirect(routes.home.href(), 302);

      // Copy the Set-Cookie headers from the sign-out response to clear the session
      const setCookieHeaders = signOutResponse.headers.getSetCookie();
      setCookieHeaders.forEach((cookie) => {
        redirectResponse.headers.append("Set-Cookie", cookie);
      });

      return redirectResponse;
    },
  } satisfies Controller<typeof routes.auth>,
  oauth: {
    login: {
      index({ request }: { request: Request }) {
        // check url params to assert that redirect uri is passed
        const url = new URL(request.url);
        const params = RequestValidator.parseQueryParams(url);
        if (!params.redirect_uri) {
          return Response.error();
        }
        return render(
          <UnauthedLayout
            assets={{ scripts: [routes.js.href({ path: "login" })] }}
          >
            <div id="root"></div>
          </UnauthedLayout>
        );
      },
      async action({ request }: { request: Request }) {
        const url = new URL(request.url);
        const params = RequestValidator.parseQueryParams(url);
        if (!params.redirect_uri) {
          return Response.error();
        }
        const formData = await request.formData();
        const email = formData.get("email") ?? "";
        const password = formData.get("password") ?? "";
        try {
          const result = await authService.signin(
            email.toString(),
            password.toString()
          );

          const { token } = await result.json();
          const redirectUrl = new URL(params.redirect_uri);
          redirectUrl.searchParams.set("code", token);

          return Response.redirect(redirectUrl.toString(), 302);
        } catch (e) {
          return Response.json(
            {
              error: "invalid_grant",
              error_description: "Invalid credentials",
            },
            { status: 401 }
          );
        }
      },
    },
  } satisfies Controller<typeof routes.oauth>,
};
