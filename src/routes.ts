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
      param: "slug",
    }),
    destroy: { pattern: "/profiles/destroy/:id", method: "POST" },
    api: {
      index: "/api/profiles",
      edit: form("/api/profiles/:slug"),
    },
  },
  rules: {
    ...resources("rules", {
      exclude: ["update", "destroy", "edit"],
      param: "slug",
    }),
    destroy: { pattern: "/rules/destroy/:id", method: "POST" },
    api: {
      index: "api/rules",
      show: form("/api/rules/:slug"),
    },
  },
  mcps: {
    ...resources("mcps", {
      exclude: ["update", "destroy", "edit"],
      param: "slug",
    }),
    destroy: { pattern: "/mcps/destroy/:id", method: "POST" },
    api: {
      index: "api/mcps",
      show: form("/api/mcps/:slug"),
    },
  },
  users: {
    show: { pattern: "/:user", method: "GET" },
    profile: {
      pattern: "/:user/profiles/:slug",
      method: "GET",
    },
    rule: {
      pattern: "/:user/rules/:slug",
      method: "GET",
    },
    mcp: {
      pattern: "/:user/mcps/:slug",
      method: "GET",
    },
    api: {
      profiles: "/api/:user/profiles",
      profile: "/api/:user/profiles/:slug",
      rule: "/api/:user/rules/:slug",
      mcp: "/api/:user/mcps/:slug",
    },
  },
});
