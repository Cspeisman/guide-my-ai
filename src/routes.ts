import { form, resources, route } from "@remix-run/fetch-router";

export const routes = route({
  js: "/js/*path",
  css: "/css/*path",
  favicon: "/favicon.ico",
  about: "/about",
  home: "/",
  dashboard: "/dashboard",
  auth: {
    signup: form("/auth/signup"),
    login: form("/auth/login"),
    callback: "/auth/callback",
    logout: {
      pattern: "/auth/logout",
      method: "POST",
    },
    api: {
      validateToken: { pattern: "api/validateToken", method: "POST" },
    },
  },
  profiles: {
    ...resources("profiles", {
      exclude: ["destroy", "update"],
    }),
    destroy: { pattern: "/profiles/destroy/:id", method: "POST" },
    api: {
      index: "/api/profiles",
      edit: form("/api/profiles/:id"),
    },
  },
  rules: {
    ...resources("rules", {
      exclude: ["update", "destroy", "edit"],
    }),
    destroy: { pattern: "/rules/destroy/:id", method: "POST" },
    api: {
      index: "api/rules",
      show: form("/api/rules/:id"),
    },
  },
  mcps: {
    ...resources("mcps", {
      exclude: ["update", "destroy", "edit"],
    }),
    destroy: { pattern: "/mcps/destroy/:id", method: "POST" },
    api: {
      index: "api/mcps",
      show: form("/api/mcps/:id"),
    },
  },
  users: {
    show: { pattern: "/:user", method: "GET" },
    profile: {
      pattern: "/:user/profiles/:id",
      method: "GET",
    },
    rule: {
      pattern: "/:user/rules/:id",
      method: "GET",
    },
    mcp: {
      pattern: "/:user/mcps/:id",
      method: "GET",
    },
    api: {
      show: { pattern: "/api/users/:user", method: "GET" },
      profile: { pattern: "/api/users/:user/profiles/:id", method: "GET" },
    },
  },
});
