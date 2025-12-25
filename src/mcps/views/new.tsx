import React from "react";
import { Layout } from "../../layouts/Layout";
import { routes } from "../../routes";

export function New({ userName }: { userName?: string | null }) {
  return (
    <Layout activeNav="mcps" userName={userName}>
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-gray-900 font-mono">
              Create New MCP
            </h2>
            <a
              href={routes.mcps.index.href()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
            >
              ← Back to MCPs
            </a>
          </div>
          <p className="text-gray-600">
            Configure a new MCP server for your profiles
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <form method="post" action={routes.mcps.create.href()}>
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                MCP Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Enter MCP name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="context"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Context (JSON)
              </label>
              <textarea
                id="context"
                name="context"
                rows={10}
                required
                placeholder='{"key": "value"}'
                defaultValue={`{"mcpServers": {\n\n\  }\n}`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter valid JSON for the MCP context
              </p>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
              >
                Create MCP
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
