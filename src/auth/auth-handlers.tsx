import { render } from "../utils";
import { RequestValidator } from "../utils/request-validator";
import { AuthService } from "./auth-service";
import { UnauthedLayout } from "../layouts/UnauthedLayout";
import { LoginPage } from "./views/login";
import React from "react";
import { routes } from "../routes";

const authService = new AuthService();

export const authHandlers = {
  auth: {
    signup: {
      index() {
        return render(
          <UnauthedLayout
            assets={{ scripts: [routes.js.href({ path: "signup" })] }}
          >
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 font-mono mb-2">
                  Create Account
                </h2>
                <p className="text-gray-600">Sign up to get started</p>
              </div>

              <div
                id="error"
                className="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              ></div>
              <div
                id="success"
                className="hidden bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
              ></div>

              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <form
                  id="signupForm"
                  action={routes.auth.signup.action.href()}
                  method="post"
                >
                  <div className="mb-6">
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      autoFocus
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      autoComplete="new-password"
                      minLength={8}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                    >
                      Sign Up
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href={routes.auth.login.index.href()}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Sign in
                </a>
              </div>
            </div>
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
          />
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
  },
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
          />
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
  },
};
