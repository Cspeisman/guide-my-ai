import { createRouter } from "@remix-run/fetch-router";
import { betterAuthClient } from "./auth";
import { createApiAuthMiddleware } from "./auth/auth-middleware";
import { authHandlers } from "./auth/auth-handlers";
import { profileHandlers } from "./profiles/profile-handlers";
import { serveStaticFile } from "./utils";
import { rulesHandlers } from "./rules/rules-handlers";
import { mcpsHandlers } from "./mcps/mcps-handlers";
import { routes } from "./routes";
import { homeHandler } from "./home-handler";

// Create router with middleware
const router = createRouter({
  middleware: [createApiAuthMiddleware()],
});

// Map routes to handlers
router.map(routes, {
  js({ request }) {
    return serveStaticFile(request);
  },
  css({ request }) {
    return serveStaticFile(request);
  },
  ...homeHandler(),
  ...authHandlers,
  profiles: profileHandlers(),
  rules: rulesHandlers(),
  mcps: mcpsHandlers(),
});

// Start server
const server = Bun.serve({
  port: 3000,
  fetch: async (req) => {
    const url = new URL(req.url);

    // Handle Better Auth routes
    if (url.pathname.startsWith("/api/auth")) {
      return betterAuthClient.handler(req);
    }

    // Handle other routes with the router
    return router.fetch(req);
  },
});

console.log(`🚀 Server running at http://localhost:${server.port}`);
