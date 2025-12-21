import React from "react";
import { Mcp } from "../mcp";
import { Settings } from "lucide-react";
import { CreatedAt } from "../../utils/created-at";
import { routes } from "../../routes";

export function McpsList({ mcps }: { mcps: Mcp[] }) {
  const formatJsonPreview = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const preview = JSON.stringify(parsed, null, 2);
      return preview.length > 200 ? preview.substring(0, 200) + "..." : preview;
    } catch {
      return (
        jsonString.substring(0, 200) + (jsonString.length > 200 ? "..." : "")
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="text-gray-900 flex items-center gap-3">
          <Settings className="h-6 w-6 text-purple-500" />
          <h2 className="text-3xl font-bold font-mono">MCPs</h2>
        </div>
        <a
          href={routes.mcps.new.href()}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium underline hover:bg-indigo-50 hover:text-indigo-900 transition-colors px-3 py-2"
        >
          + New MCP
        </a>
      </div>
      {mcps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <p className="text-gray-600 mb-4">
            No MCPs yet. Create your first MCP!
          </p>
          <a
            href={routes.mcps.new.href()}
            className="inline-block px-6 py-2 bg-indigo-50 text-indigo-900 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Create MCP
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {mcps.map((mcp) => (
            <a
              key={mcp.id}
              href={routes.mcps.show.href({ id: mcp.id })}
              className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {mcp.name}
                </h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <pre className="whitespace-pre-wrap font-mono text-xs overflow-hidden">
                  {formatJsonPreview(mcp.context)}
                </pre>
              </div>
              <CreatedAt date={mcp.createdAt} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
