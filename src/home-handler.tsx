import type { RequestContext } from "@remix-run/fetch-router";
import { userNameKey } from "./auth/auth-middleware";
import { UnauthedLayout } from "./layouts/UnauthedLayout";
import { routes } from "./routes";
import { render } from "./utils";

export const homeHandler = () => {
  return {
    async home(context: RequestContext) {
      const userName = context.storage.get(userNameKey);

      if (userName) {
        return Response.redirect(routes.users.href({user: userName}));
      }

      return render(
            <UnauthedLayout>
              <div className="mx-auto text-center py-16">
                <h1 className="text-3xl font-bold text-gray-900 font-mono mb-6">
                  Welcome to Guide My AI
                </h1>
                <p className="text-gray-600 mb-8">
                  Centralize your AI profiles, rules, and MCP servers. Pull them
                  into any project with ease.
                </p>
                <div className="flex justify-center gap-4">
                  <a
                    href={routes.auth.signup.index.href()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                  >
                    Sign Up
                  </a>
                  <a
                    href={routes.auth.login.index.href()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-8 py-3 rounded-lg transition-colors"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            </UnauthedLayout>
      );
    },
  };
};
