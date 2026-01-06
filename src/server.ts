import { createRouter } from "@remix-run/fetch-router";
import { aboutHandler } from "./about-handler";
import { betterAuthClient } from "./auth";
import { authHandlers } from "./auth/auth-handlers";
import { createApiAuthMiddleware } from "./auth/auth-middleware";
import { AuthService } from "./auth/auth-service";
import { homeHandler } from "./home-handler";
import { mcpsHandlers } from "./mcps/mcps-handlers";
import { logger } from "./middleware/logger";
import { profileHandlers } from "./profiles/profile-handlers";
import { routes } from "./routes";
import { rulesHandlers } from "./rules/rules-handlers";
import { usersHandler } from "./users/users-handler";
import { serveStaticFile } from "./utils";
import { communityHandlers } from "./community/community-handlers";

// Create router with middleware
const router = createRouter({
  middleware: [logger({ logBody: true }), createApiAuthMiddleware()],
});

// Map routes to handlers
router.map(routes, {
  js({ request }) {
    return serveStaticFile(request);
  },
  css({ request }) {
    return serveStaticFile(request);
  },
  favicon({ request }) {
    return serveStaticFile(request);
  },
  ...homeHandler(),
  ...aboutHandler(),
  ...authHandlers(new AuthService()),
  profiles: profileHandlers(),
  rules: rulesHandlers(),
  mcps: mcpsHandlers(),
  community: communityHandlers(),
  users: usersHandler(),
});

// Start server
const server = Bun.serve({
  port: process.env.PORT || 3000,
  hostname: "0.0.0.0", // Listen on all interfaces for Docker/Fly.io
  fetch: async (req) => {
    try {
      const url = new URL(req.url);

      // Handle Better Auth routes
      if (url.pathname.startsWith("/api/auth")) {
        return betterAuthClient.handler(req);
      }

      // Handle other routes with the router
      return router.fetch(req);
    } catch (error) {
      console.error("Request error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log(`🚀 Server running on ${server.hostname}:${server.port}`);
