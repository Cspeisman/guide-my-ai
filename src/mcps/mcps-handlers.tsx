import React from "react";
import { Layout } from "../layouts/Layout";
import { Mcp } from "./mcp";
import { McpsRepository } from "./mcps-repository";
import { New } from "./views/new";
import { McpsList } from "./views/mcps-list";
import { Controller } from "@remix-run/fetch-router";
import { routes } from "../routes";
import { userIdKey, userNameKey } from "../auth/auth-middleware";
import { render } from "../utils";

export const mcpsHandlers = (
  dependecies = { mcpsRepository: new McpsRepository() }
) => {
  const { mcpsRepository } = dependecies;
  return {
    async index(context) {
      const userId = context.storage.get(userIdKey);
      const userName = context.storage.get(userNameKey);
      const userMcps = await mcpsRepository.getMcpsByUserId(userId!);

      return render(
        <Layout activeNav="mcps" userName={userName}>
          <McpsList mcps={userMcps} />
        </Layout>
      );
    },
    async show(context) {
      const id = context.params?.id;
      const userName = context.storage.get(userNameKey);
      const mcp = await mcpsRepository.getMcpById(id);

      if (!mcp) {
        return Response.json({ error: "MCP not found" }, { status: 404 });
      }

      return render(
        <Layout
          assets={{ scripts: [routes.js.href({ path: "mcp" })] }}
          userName={userName}
        />
      );
    },
    new(context) {
      const userName = context.storage.get(userNameKey);
      return render(<New userName={userName} />);
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

      // Validate that context is valid JSON
      try {
        JSON.parse(mcpContext.toString());
      } catch (e) {
        return Response.json(
          { error: "Context must be valid JSON" },
          { status: 400 }
        );
      }

      const userId = context.storage.get(userIdKey);

      if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Insert the mcp into the database
      await mcpsRepository.createMcp({
        name: name.toString(),
        context: mcpContext.toString(),
        userId: userId,
      });

      // Redirect to the mcps index or show page after creation
      return Response.redirect(routes.mcps.index.href(), 302);
    },
    async destroy(context) {
      const id = context.params?.id;
      const userId = context.storage.get(userIdKey);

      // Parse the form data to check the _method field
      const formData = await context.request.formData();
      const method = formData.get("_method");

      // Validate that the _method field is DELETE
      if (method !== "DELETE") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
      }

      // Get the MCP to check ownership
      const mcp = await mcpsRepository.getMcpById(id);

      if (!mcp) {
        return Response.json({ error: "MCP not found" }, { status: 404 });
      }

      // Verify the user owns the MCP
      if (mcp.userId !== userId) {
        return Response.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Delete the MCP
      await mcpsRepository.deleteMcp(id);

      // Redirect to MCPs index
      return Response.redirect(routes.mcps.index.href(), 303);
    },
    api: {
      async index(context) {
        const userId = context.storage.get(userIdKey);
        const userMcps = await mcpsRepository.getMcpsByUserId(userId!);

        return Response.json(userMcps.map((mcp) => mcp.toJson()));
      },
      show: {
        async index(context) {
          const id = context.params?.id;
          const mcp = await mcpsRepository.getMcpById(id);

          if (!mcp) {
            return Response.json({ error: "MCP not found" }, { status: 404 });
          }

          return Response.json(mcp.toJson());
        },
        async action(context) {
          const id = context.params?.id;
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

          // Validate that context is valid JSON
          try {
            JSON.parse(mcpContext);
          } catch (e) {
            return Response.json(
              { error: "Context must be valid JSON" },
              { status: 400 }
            );
          }

          // Get the current MCP to preserve fields like userId and createdAt
          const currentMcp = await mcpsRepository.getMcpById(id);
          if (!currentMcp) {
            return Response.json({ error: "MCP not found" }, { status: 404 });
          }

          // Update the mcp
          const updatedMcp = await mcpsRepository.updateMcp(
            new Mcp(
              id,
              name,
              mcpContext,
              currentMcp.createdAt,
              currentMcp.userId
            )
          );

          return Response.json(updatedMcp.toJson());
        },
      },
    },
  } satisfies Controller<typeof routes.mcps>;
};
