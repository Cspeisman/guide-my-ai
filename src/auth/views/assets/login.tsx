import React, { useState, useEffect, FormEvent } from "react";
import { createRoot } from "react-dom/client";
import { Github } from "lucide-react";
import { routes } from "../../../routes";
import { authClient } from "../../auth-client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirectUri, setRedirectUri] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [formAction, setFormAction] = useState(routes.auth.login.action.href());

  useEffect(() => {
    // Check if this is an OAuth login (has redirect_uri in URL)
    const urlParams = new URLSearchParams(window.location.search);
    const uri = urlParams.get("redirect_uri");
    const name = urlParams.get("client_name");

    if (uri) {
      setRedirectUri(uri);
      setFormAction(`/oauth/login?redirect_uri=${encodeURIComponent(uri)}`);
    }

    if (name) {
      setClientName(name);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch(formAction, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Login failed" }));
        throw new Error(
          errorData.error_description || errorData.error || "Login failed"
        );
      }

      // Get the response
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      // For OAuth flow, redirect to the authorization URL returned by the server
      if (redirectUri && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      // For regular login, store token if provided
      if (result.token) {
        localStorage.setItem("auth_token", result.token);
      }

      // Redirect to home or dashboard
      window.location.href = routes.home.href();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: routes.home.href(),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred with GitHub sign-in"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 font-mono mb-2">
          {redirectUri ? "Authorize Application" : "Sign In"}
        </h2>
        <p className="text-gray-600">
          {redirectUri ? "Please sign in to continue" : "Welcome back"}
        </p>
      </div>

      {clientName && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
          <strong>Application:</strong> <span>{clientName}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <form id="loginForm" onSubmit={handleSubmit}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              autoFocus
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? redirectUri
                  ? "Redirecting..."
                  : "Signing in..."
                : "Sign In"}
            </button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGitHubSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Github className="w-5 h-5" />
          <span className="font-medium text-gray-700">GitHub</span>
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <a
          href={routes.auth.signup.href()}
          className="text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          Sign up
        </a>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<LoginForm />);
}
