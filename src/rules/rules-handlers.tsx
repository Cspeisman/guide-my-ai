import { Controller } from "@remix-run/fetch-router";
import { userIdKey, userNameKey } from "../auth/auth-middleware";
import { Layout } from "../layouts/Layout";
import { routes } from "../routes";
import { render } from "../utils";
import { withOwnership, withOwnershipJson } from "../utils/authorization";
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
      const userName = context.storage.get(userNameKey);
      const userRules = await rulesRepository.getRulesByUserId(userId!);

      return render(
        <Layout activeNav="rules" userName={userName}>
          <RulesList rules={userRules} />
        </Layout>
      );
    },
    new(context) {
      const userName = context.storage.get(userNameKey);
      return render(<New userName={userName} />);
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
    show: withOwnership(
      async (context) => rulesRepository.getRuleById(context.params?.id!),
      async (context) => {
        const userName = context.storage.get(userNameKey);
        return render(
          <Layout
            assets={{ scripts: [routes.js.href({ path: "rule" })] }}
            userName={userName}
          />
        );
      }
    ),

    api: {
      async index(context) {
        const userId = context.storage.get(userIdKey);
        const userRules = await rulesRepository.getRulesByUserId(userId!);

        return Response.json(userRules.map((rule) => rule.toJson()));
      },
      show: {
        index: withOwnershipJson(
          async (context) => rulesRepository.getRuleById(context.params?.id!),
          async (_context, rule) => {
            return Response.json(rule.toJson());
          }
        ),
        action: withOwnershipJson(
          async (context) => rulesRepository.getRuleById(context.params?.id!),
          async (context, currentRule) => {
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
              new Rule(
                currentRule.id,
                name,
                content,
                new Date(),
                currentRule.userId
              )
            );

            return Response.json(updatedRule.toJson());
          }
        ),
      },
    },
    destroy: withOwnership(
      async (context) => rulesRepository.getRuleById(context.params?.id!),
      async (context, rule) => {
        // Parse the form data to check the _method field
        const formData = await context.request.formData();
        const method = formData.get("_method");

        // Validate that the _method field is DELETE
        if (method !== "DELETE") {
          return new Response("Method not allowed", { status: 405 });
        }

        // Delete the rule
        await rulesRepository.deleteRule(rule.id);

        // Redirect to rules index
        return Response.redirect(routes.rules.index.href(), 303);
      }
    ),
  } satisfies Controller<typeof routes.rules>;
};
