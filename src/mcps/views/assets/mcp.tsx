import React, { Suspense, use, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Mcp } from "../../mcp";
import { EditableField } from "../../../rules/views/assets/editable-field";
import { useEditableField } from "./hooks/use-editable-field";
import { routes } from "../../../routes";
import { CreatedAt } from "../../../utils/created-at";

const getMcp = async (id: string) => {
  const response = await fetch(routes.mcps.api.show.index.href({ id }));
  if (!response.ok) {
    throw new Error("Failed to fetch MCP");
  }
  return response.json() as Promise<{
    id: string;
    name: string;
    context: string;
    createdAt: string;
  }>;
};

const McpDisplay = ({
  mcpPromise,
}: {
  mcpPromise: Promise<{
    id: string;
    name: string;
    context: string;
    createdAt: string;
  }>;
}) => {
  const mcpData = use(mcpPromise);
  const mcp = new Mcp(
    mcpData.id,
    mcpData.name,
    mcpData.context,
    new Date(mcpData.createdAt)
  );

  // Track the current field values for API updates
  const [currentName, setCurrentName] = useState(mcp.name);
  const [currentContext, setCurrentContext] = useState(mcp.context);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Format JSON for display
  const formatJson = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const nameField = useEditableField(mcp.id, "name", currentName, {
    name: currentName,
    context: currentContext,
  });

  const contextField = useEditableField(
    mcp.id,
    "context",
    formatJson(currentContext),
    {
      name: currentName,
      context: currentContext,
    }
  );

  const handleNameSave = async () => {
    const oldName = currentName;
    setCurrentName(nameField.value);
    await nameField.handleSave();
    // If save failed, the hook will reset the value
    if (nameField.value !== oldName) {
      setCurrentName(nameField.value);
    }
  };

  const handleContextChange = (value: string) => {
    contextField.setValue(value);
    // Validate JSON as user types
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (e) {
      setJsonError("Invalid JSON format");
    }
  };

  const handleContextSave = async () => {
    // Validate JSON before saving
    try {
      const parsed = JSON.parse(contextField.value);
      const minified = JSON.stringify(parsed); // Store minified
      const oldContext = currentContext;
      setCurrentContext(minified);
      setJsonError(null);
      await contextField.handleSave();
      // If save failed, the hook will reset the value
      if (contextField.value !== formatJson(oldContext)) {
        setCurrentContext(minified);
      }
    } catch (e) {
      setJsonError("Cannot save invalid JSON");
      contextField.setValue(formatJson(currentContext)); // Reset to valid JSON
      contextField.setIsEditing(false);
    }
  };

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    const confirmed = confirm(
      "Are you sure you want to delete this MCP? This action cannot be undone."
    );

    if (!confirmed) {
      e.preventDefault();
    }
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="space-y-6">
          <EditableField
            label="Name"
            value={nameField.value}
            isEditing={nameField.isEditing}
            isSaving={nameField.isSaving}
            onEdit={() => nameField.setIsEditing(true)}
            onChange={nameField.setValue}
            onSave={handleNameSave}
            onCancel={nameField.handleCancel}
            multiline={false}
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Context (JSON)
            </span>
            {contextField.isEditing ? (
              <div>
                <textarea
                  value={contextField.value}
                  onChange={(e) => handleContextChange(e.target.value)}
                  onBlur={handleContextSave}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      contextField.handleCancel();
                      setJsonError(null);
                    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.currentTarget.blur();
                    }
                  }}
                  autoFocus
                  disabled={contextField.isSaving}
                  rows={Math.max(contextField.value.split("\n").length, 5)}
                  className="text-gray-800 bg-gray-50 p-4 rounded-lg leading-relaxed whitespace-pre-wrap font-mono text-sm border-2 border-blue-500 focus:outline-none focus:border-blue-600 resize-vertical w-full"
                />
                {jsonError && (
                  <p className="mt-2 text-sm text-red-600">{jsonError}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Press Cmd/Ctrl+Enter to save, Esc to cancel
                </p>
              </div>
            ) : (
              <pre
                className="text-gray-800 bg-gray-50 p-4 rounded-lg leading-relaxed whitespace-pre-wrap font-mono text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => contextField.setIsEditing(true)}
              >
                {contextField.value}
              </pre>
            )}
          </div>
          <CreatedAt date={mcp.createdAt} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-8 gap-4">
        <a
          href={routes.mcps.index.href()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
        >
          ← Back to MCPs
        </a>

        <form
          method="post"
          action={routes.mcps.destroy.href({ id: mcp.id })}
          onSubmit={handleDelete}
        >
          <input type="hidden" name="_method" value="DELETE" />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm hover:shadow"
          >
            Delete MCP
          </button>
        </form>
      </div>
    </div>
  );
};

const McpView = ({ mcpId }: { mcpId: string }) => {
  const mcpPromise = useMemo(() => getMcp(mcpId), [mcpId]);

  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading MCP...</span>
            </div>
          </div>
        </div>
      }
    >
      <McpDisplay mcpPromise={mcpPromise} />
    </Suspense>
  );
};

// Extract mcp ID from URL (e.g., /mcps/123)
const getMcpIdFromUrl = () => {
  const match = routes.mcps.show.match(window.location.toString());
  return match?.params?.id ?? null;
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const mcpId = getMcpIdFromUrl();
  if (mcpId) {
    const root = createRoot(rootElement);
    root.render(<McpView mcpId={mcpId} />);
  } else {
    console.error("No MCP ID found in URL");
  }
}
