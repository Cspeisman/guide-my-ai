import { form, resources, route } from "@remix-run/fetch-router";

export const routes = route({
  js: "/js/*path",
  css: "/css/*path",
  home: "/",
  auth: {
    signup: form("/auth/signup"),
    login: form("/auth/login"),
    logout: { pattern: "/auth/logout", method: "POST" },
  },
  oauth: {
    login: form("/oauth/login"),
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
});
