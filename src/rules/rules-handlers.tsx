import { Controller } from "@remix-run/fetch-router";
import { userIdKey, userNameKey } from "../auth/auth-middleware";
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
  const NotFoundComponent = (props: { id: string }) => (
    <Layout>
      <pre>
        Sorry we were unable to find rule with ID: {props.id} assigned to this
        user.
      </pre>
    </Layout>
  );

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
    async show(context) {
      const userId = context.storage.get(userIdKey);
      if (userId) {
        const rule = await rulesRepository.getRuleByIdAndUserId(
          context.params.id,
          userId
        );
        if (rule) {
          const userName = context.storage.get(userNameKey);
          return render(
            <Layout
              assets={{ scripts: [routes.js.href({ path: "rule" })] }}
              userName={userName}
            />
          );
        }
      }
      return render(<NotFoundComponent id={context.params.id} />);
    },

    api: {
      async index(context) {
        const userId = context.storage.get(userIdKey);
        const userRules = await rulesRepository.getRulesByUserId(userId!);

        return Response.json(userRules.map((rule) => rule.toJson()));
      },
      show: {
        async index(context) {
          const userId = context.storage.get(userIdKey);
          if (userId) {
            const rule = await rulesRepository.getRuleByIdAndUserId(
              context.params?.id!,
              userId
            );
            if (rule) {
              return Response.json(rule.toJson());
            }
          }
          return Response.json(
            { msg: "unable to find the resource for current user" },
            { status: 404 }
          );
        },
        async action(context) {
          const userId = context.storage.get(userIdKey);
          if (userId) {
            const currentRule = await rulesRepository.getRuleByIdAndUserId(
              context.params.id,
              userId
            );
            if (currentRule) {
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
          }
          return Response.json(
            { msg: "unable to update rule" },
            { status: 404 }
          );
        },
      },
    },
    async destroy(context) {
      const userId = context.storage.get(userIdKey);

      const formData = await context.request.formData();
      const method = formData.get("_method");

      // Validate that the _method field is DELETE
      if (method !== "DELETE") {
        return new Response("Method not allowed", { status: 405 });
      }

      if (userId) {
        const rule = await rulesRepository.getRuleByIdAndUserId(
          context.params.id,
          userId
        );

        if (rule) {
          // Delete the rule
          await rulesRepository.deleteRule(rule.id, rule.userId);

          // Redirect to rules index
          return Response.redirect(routes.rules.index.href(), 303);
        }
      }

      return render(<NotFoundComponent id={context.params.id} />);
    },
  } satisfies Controller<typeof routes.rules>;
};
