import { Controller } from "@remix-run/fetch-router";
import React from "react";
import { getUserContext } from "../auth/user-context";
import { Layout } from "../layouts/Layout";
import { routes } from "../routes";
import { render } from "../utils";
import { Mcp } from "./mcp";
import { McpsRepository } from "./mcps-repository";
import { validateMcpContext } from "./utils/validate-mcp-context";
import { McpsList } from "./views/mcps-list";
import { New } from "./views/new";

export const mcpsHandlers = (
  dependecies = { mcpsRepository: new McpsRepository() }
) => {
  const { mcpsRepository } = dependecies;
  const NotFoundComponent = (props: { id: string }) => (
    <Layout>
      <pre>
        Sorry we were unable to find mcp with ID: {props.id} assigned to this
        user.
      </pre>
    </Layout>
  );

  return {
    async index(context) {
      const user = getUserContext(context);
      const userMcps = await mcpsRepository.getMcpsByUserId(user.userId!);

      return render(
        <Layout activeNav="mcps" user={user}>
          <McpsList mcps={userMcps} />
        </Layout>
      );
    },
    async show(context) {
      const user = getUserContext(context);
      if (user.userId) {
        const mcp = await mcpsRepository.getMcpByIdAndUserId(
          context.params.id,
          user.userId
        );
        if (mcp) {
          return render(
            <Layout
              assets={{ scripts: [routes.js.href({ path: "mcp" })] }}
              user={user}
            />
          );
        }
      }
      return render(<NotFoundComponent id={context.params.id} />);
    },
    new(context) {
      const user = getUserContext(context);
      return render(
        <New
          userName={user.userName}
          githubUrl={user.githubUrl}
          githubUsername={user.githubUsername}
        />
      );
    },
    async create(context) {
      const formData = await context.request.formData();
      const name = formData.get("name");
      const mcpContext = formData.get("context");

      if (!name) {
        return Response.json({ error: "Name is required" }, { status: 400 });
      }

      if (!mcpContext) {
        return Response.json({ error: "Context is required" }, { status: 400 });
      }

      // Validate MCP context structure
      const validation = validateMcpContext(mcpContext.toString());
      if (!validation.valid) {
        return Response.json({ error: validation.error }, { status: 400 });
      }

      const user = getUserContext(context);

      if (!user.userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Insert the mcp into the database
      await mcpsRepository.createMcp({
        name: name.toString(),
        context: mcpContext.toString(),
        userId: user.userId,
      });

      // Redirect to the mcps index or show page after creation
      return Response.redirect(routes.mcps.index.href(), 302);
    },
    async destroy(context) {
      const user = getUserContext(context);

      const formData = await context.request.formData();
      const method = formData.get("_method");

      // Validate that the _method field is DELETE
      if (method !== "DELETE") {
        return new Response("Method not allowed", { status: 405 });
      }

      if (user.userId) {
        const mcp = await mcpsRepository.getMcpByIdAndUserId(
          context.params.id,
          user.userId
        );

        if (mcp) {
          // Delete the MCP
          await mcpsRepository.deleteMcp(mcp.id, mcp.userId);

          // Redirect to MCPs index
          return Response.redirect(routes.mcps.index.href(), 303);
        }
      }

      return render(<NotFoundComponent id={context.params.id} />);
    },
    api: {
      async index(context) {
        const user = getUserContext(context);
        const userMcps = await mcpsRepository.getMcpsByUserId(user.userId!);

        return Response.json(userMcps.map((mcp) => mcp.toJson()));
      },
      show: {
        async index(context) {
          const user = getUserContext(context);
          if (user.userId) {
            const mcp = await mcpsRepository.getMcpByIdAndUserId(
              context.params?.id!,
              user.userId
            );
            if (mcp) {
              return Response.json(mcp.toJson());
            }
          }
          return Response.json(
            { msg: "unable to find the resource for current user" },
            { status: 404 }
          );
        },
        async action(context) {
          const user = getUserContext(context);
          if (user.userId) {
            const currentMcp = await mcpsRepository.getMcpByIdAndUserId(
              context.params.id,
              user.userId
            );
            if (currentMcp) {
              const body = await context.request.json();
              const { name, context: mcpContext } = body;

              if (!name || typeof name !== "string") {
                return Response.json(
                  { error: "Name is required" },
                  { status: 400 }
                );
              }

              if (!mcpContext || typeof mcpContext !== "string") {
                return Response.json(
                  { error: "Context is required" },
                  { status: 400 }
                );
              }

              // Validate MCP context structure
              const validation = validateMcpContext(mcpContext);
              if (!validation.valid) {
                return Response.json(
                  { error: validation.error },
                  { status: 400 }
                );
              }

              // Update the mcp
              const updatedMcp = await mcpsRepository.updateMcp(
                new Mcp(
                  currentMcp.id,
                  name,
                  mcpContext,
                  currentMcp.createdAt,
                  currentMcp.userId
                )
              );

              return Response.json(updatedMcp.toJson());
            }
          }
          return Response.json(
            { msg: "unable to update mcp" },
            { status: 404 }
          );
        },
      },
    },
  } satisfies Controller<typeof routes.mcps>;
};
