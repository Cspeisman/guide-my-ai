import { Controller } from "@remix-run/fetch-router";
import { UnauthedLayout } from "../layouts/UnauthedLayout";
import { routes } from "../routes";
import { render } from "../utils";
import { RequestValidator } from "../utils/request-validator";
import { AuthService } from "./auth-service";
import { Login } from "./views/login";
import { SignupView } from "./views/signup-view";

/**
 * Creates a redirect response with Set-Cookie headers copied from the source response
 */
function redirectWithCookies(
  sourceResponse: Response,
  redirectUrl: string,
  status: number = 302
): Response {
  const redirectResponse = Response.redirect(redirectUrl, status);
  const setCookieHeaders = sourceResponse.headers.getSetCookie();
  setCookieHeaders.forEach((cookie) => {
    redirectResponse.headers.append("Set-Cookie", cookie);
  });
  return redirectResponse;
}

export const authHandlers = (authService: AuthService) => {
  return {
    auth: {
      signup: {
        index() {
          return render(
            <UnauthedLayout
              assets={{ scripts: [routes.js.href({ path: "login" })] }}
            >
              <SignupView />
            </UnauthedLayout>
          );
        },
        async action({ request }) {
          const formData = await request.formData();
          const name = formData.get("name");
          const email = formData.get("email");
          const password = formData.get("password");

          if (!name || !email || !password) {
            return Response.json({ error: "Error Occured" }, { status: 400 });
          }
          const response = await authService.signup(
            name.toString(),
            email.toString(),
            password.toString()
          );

          return redirectWithCookies(response, routes.auth.callback.href());
        },
      },
      login: {
        index() {
          return render(
            <UnauthedLayout
              assets={{ scripts: [routes.js.href({ path: "login" })] }}
            >
              <Login />
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
          const response = await authService.signin(
            (email ?? "").toString(),
            (password ?? "").toString()
          );

          return redirectWithCookies(
            response,
            routes.auth.callback.href(null, new URL(request.url).searchParams)
          );
        },
      },
      async callback({ request }: { request: Request }) {
        const url = new URL(request.url);
        const params = RequestValidator.parseQueryParams(url);

        // If there is no redirect_uri, redirect to homepage
        if (!params.redirect_uri) {
          return Response.redirect(routes.home.href(), 302);
        }

        // Get the session using Better Auth's getSession method
        try {
          const session = await authService.getSession(request.headers);
          if (!session) {
            return Response.redirect(routes.home.href(), 302);
          }

          // Extract the session token from the session
          const token = session.session.token;
          // Redirect to redirect_uri with token in search params
          const redirectUrl = new URL(params.redirect_uri);
          redirectUrl.searchParams.set("token", token);

          return Response.redirect(redirectUrl.toString(), 302);
        } catch (error) {
          // If session retrieval fails, redirect to homepage
          return Response.redirect(routes.home.href(), 302);
        }
      },
      async logout({ request }: { request: Request }) {
        // Call Better Auth's sign-out API directly
        const signOutResponse = await authService.signout(request.headers);

        return redirectWithCookies(signOutResponse, routes.home.href());
      },
      api: {
        async validateToken({ request }) {
          const { token } = await request.json();
          if (token) {
            const isValid = await authService.validateToken(token);
            return Response.json({ isValid });
          }
          return Response.json({ isvalid: false });
        },
      },
    } satisfies Controller<typeof routes.auth>,
  };
};
