import { Controller } from "@remix-run/fetch-router";
import React from "react";
import { userIdKey } from "../auth/auth-middleware";
import { Layout } from "../layouts/Layout";
import { routes } from "../routes";
import { render } from "../utils";
import { Rule } from "./rule";
import { RulesRepository } from "./rules-repository";
import { New } from "./views/new";
import { RulesList } from "./views/rules-list";

export const rulesHandlers = (
  dependecies = { rulesRepository: new RulesRepository() }
) => {
  const { rulesRepository } = dependecies;
  return {
    async index(context) {
      const userId = context.storage.get(userIdKey);
      const userRules = await rulesRepository.getRulesByUserId(userId!);

      return render(
        <Layout activeNav="rules">
          <RulesList rules={userRules} />
        </Layout>
      );
    },
    new() {
      return render(<New />);
    },
    async create(context) {
      const formData = await context.request.formData();
      const name = formData.get("name");
      const content = formData.get("content");

      if (!name) {
        return Response.json({ error: "Name is required" }, { status: 400 });
      }

      if (!content) {
        return Response.json({ error: "Content is required" }, { status: 400 });
      }

      const userId = context.storage.get(userIdKey);

      if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Insert the rule into the database
      await rulesRepository.createRule({
        name: name.toString(),
        content: content.toString(),
        userId: userId,
      });

      // Redirect to the rules index or show page after creation
      return Response.redirect(routes.rules.index.href(), 302);
    },
    async show(context) {
      const id = context.params?.id;
      const rule = await rulesRepository.getRuleById(id);

      if (!rule) {
        return Response.json({ error: "Rule not found" }, { status: 404 });
      }

      return render(
        <Layout assets={{ scripts: [routes.js.href({ path: "rule" })] }} />
      );
    },
    async destroy(context) {
      const id = context.params.id;

      // Parse the form data to check the _method field
      const formData = await context.request.formData();
      const method = formData.get("_method");

      // Validate that the _method field is DELETE
      if (method !== "DELETE") {
        return new Response("Method not allowed", { status: 405 });
      }

      // Delete the rule
      await rulesRepository.deleteRule(id);

      // Redirect to rules index
      return Response.redirect(routes.rules.index.href(), 303);
    },
    api: {
      async index(context) {
        const userId = context.storage.get(userIdKey);
        const userRules = await rulesRepository.getRulesByUserId(userId!);

        return Response.json(userRules.map((rule) => rule.toJson()));
      },
      show: {
        async index(context) {
          const id = context.params?.id;
          const rule = await rulesRepository.getRuleById(id);

          if (!rule) {
            return Response.json({ error: "Rule not found" }, { status: 404 });
          }

          return Response.json(rule.toJson());
        },
        async action(context) {
          const id = context.params?.id;
          const body = await context.request.json();
          const { name, content } = body;

          if (!name) {
            return Response.json(
              { error: "Name is required" },
              { status: 400 }
            );
          }

          if (!content) {
            return Response.json(
              { error: "Content is required" },
              { status: 400 }
            );
          }

          // Update the rule
          const updatedRule = await rulesRepository.updateRule(
            new Rule(id, name, content, new Date())
          );

          return Response.json(updatedRule.toJson());
        },
      },
    },
  } satisfies Controller<typeof routes.rules>;
};
