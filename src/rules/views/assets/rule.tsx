import React, { Suspense, use, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Rule } from "../../rule";
import { EditableField } from "./editable-field";
import { useEditableField } from "./hooks/use-editable-field";
import { routes } from "../../../routes";
import { CreatedAt } from "../../../utils/created-at";

const getRule = async (id: string) => {
  const response = await fetch(routes.rules.api.show.index.href({ id }));
  if (!response.ok) {
    throw new Error("Failed to fetch rule");
  }
  return response.json() as Promise<{
    id: string;
    name: string;
    content: string;
    createdAt: string;
  }>;
};

const RuleDisplay = ({
  rulePromise,
}: {
  rulePromise: Promise<{
    id: string;
    name: string;
    content: string;
    createdAt: string;
  }>;
}) => {
  const ruleData = use(rulePromise);
  const rule = new Rule(
    ruleData.id,
    ruleData.name,
    ruleData.content,
    new Date(ruleData.createdAt)
  );

  // Track the current field values for API updates
  const [currentName, setCurrentName] = useState(rule.name);
  const [currentContent, setCurrentContent] = useState(rule.content);

  const nameField = useEditableField(rule.id, "name", currentName, {
    name: currentName,
    content: currentContent,
  });

  const contentField = useEditableField(rule.id, "content", currentContent, {
    name: currentName,
    content: currentContent,
  });

  const handleNameSave = async () => {
    const oldName = currentName;
    setCurrentName(nameField.value);
    await nameField.handleSave();
    // If save failed, the hook will reset the value
    if (nameField.value !== oldName) {
      setCurrentName(nameField.value);
    }
  };

  const handleContentSave = async () => {
    const oldContent = currentContent;
    setCurrentContent(contentField.value);
    await contentField.handleSave();
    // If save failed, the hook will reset the value
    if (contentField.value !== oldContent) {
      setCurrentContent(contentField.value);
    }
  };

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    const confirmed = confirm(
      "Are you sure you want to delete this rule? This action cannot be undone."
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
          <EditableField
            label="Content"
            value={contentField.value}
            isEditing={contentField.isEditing}
            isSaving={contentField.isSaving}
            onEdit={() => contentField.setIsEditing(true)}
            onChange={contentField.setValue}
            onSave={handleContentSave}
            onCancel={contentField.handleCancel}
            multiline={true}
          />
          <CreatedAt date={rule.createdAt} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-8 gap-4">
        <a
          href={routes.rules.index.href()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
        >
          ← Back to rules
        </a>

        <form
          method="post"
          action={routes.rules.destroy.href({ id: rule.id })}
          onSubmit={handleDelete}
        >
          <input type="hidden" name="_method" value="DELETE" />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm hover:shadow"
          >
            Delete Rule
          </button>
        </form>
      </div>
    </div>
  );
};

const RuleView = ({ ruleId }: { ruleId: string }) => {
  const rulePromise = useMemo(() => getRule(ruleId), [ruleId]);

  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading rule...</span>
            </div>
          </div>
        </div>
      }
    >
      <RuleDisplay rulePromise={rulePromise} />
    </Suspense>
  );
};

// Extract rule ID from URL (e.g., /rules/123)
const getRuleIdFromUrl = () => {
  const pathParts = window.location.pathname.split("/");
  const rulesIndex = pathParts.indexOf("rules");
  return rulesIndex !== -1 ? pathParts[rulesIndex + 1] : null;
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const ruleId = getRuleIdFromUrl();
  if (ruleId) {
    const root = createRoot(rootElement);
    root.render(<RuleView ruleId={ruleId} />);
  } else {
    console.error("No rule ID found in URL");
  }
}
