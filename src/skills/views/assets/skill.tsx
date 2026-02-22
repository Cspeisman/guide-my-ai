import React, { Suspense, use, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Skill, SkillFile } from "../../skill";
import { EditableField } from "../../../rules/views/assets/editable-field";
import { useEditableField } from "./hooks/use-editable-field";
import { routes } from "../../../routes";
import { CreatedAt } from "../../../utils/created-at";

const getSkill = async (slug: string) => {
  const response = await fetch(routes.skills.api.show.index.href({ slug }));
  if (!response.ok) {
    throw new Error("Failed to fetch skill");
  }
  return response.json() as Promise<{
    id: string;
    name: string;
    slug: string;
    description: string;
    content: string;
    createdAt: string;
    userId: string;
    files: SkillFile[];
  }>;
};

const FileItem = ({
  file,
  skillSlug,
  onUpdate,
  onRemove,
}: {
  file: SkillFile;
  skillSlug: string;
  onUpdate: (files: SkillFile[]) => void;
  onRemove: (fileId: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editName, setEditName] = useState(file.fileName);
  const [editContent, setEditContent] = useState(file.fileContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (updates: {
    fileName?: string;
    fileContent?: string;
  }) => {
    setIsSaving(true);
    try {
      const response = await fetch(
        routes.skills.api.show.action.href({ slug: skillSlug }),
        {
          method: "POST",
          body: JSON.stringify({
            updateFile: { id: file.id, ...updates },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        onUpdate(data.files ?? []);
      }
    } catch (error) {
      console.error("Failed to update file:", error);
      setEditName(file.fileName);
      setEditContent(file.fileContent);
    } finally {
      setIsSaving(false);
      setIsEditingName(false);
      setIsEditingContent(false);
    }
  };

  const handleNameSave = () => {
    if (editName === file.fileName) {
      setIsEditingName(false);
      return;
    }
    handleSave({ fileName: editName });
  };

  const handleContentSave = () => {
    if (editContent === file.fileContent) {
      setIsEditingContent(false);
      return;
    }
    handleSave({ fileContent: editContent });
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-mono text-gray-800 hover:text-gray-600 transition-colors"
        >
          <span className="text-gray-400 text-xs">
            {isExpanded ? "\u25BC" : "\u25B6"}
          </span>
          {isEditingName ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditName(file.fileName);
                  setIsEditingName(false);
                } else if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              disabled={isSaving}
              className="px-2 py-1 border-2 border-blue-500 rounded text-sm font-mono focus:outline-none focus:border-blue-600"
            />
          ) : (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingName(true);
              }}
              className="hover:bg-gray-200 px-1 rounded cursor-pointer"
              title="Click to rename"
            >
              {file.fileName}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onRemove(file.id)}
            className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded p-1 transition-colors text-sm"
          >
            Remove
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-gray-200">
          {isEditingContent ? (
            <div className="p-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onBlur={handleContentSave}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setEditContent(file.fileContent);
                    setIsEditingContent(false);
                  } else if (
                    e.key === "Enter" &&
                    (e.metaKey || e.ctrlKey)
                  ) {
                    e.currentTarget.blur();
                  }
                }}
                autoFocus
                disabled={isSaving}
                rows={Math.max(editContent.split("\n").length, 5)}
                className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600 resize-vertical"
              />
              <p className="mt-1 text-xs text-gray-500">
                Press Cmd/Ctrl+Enter to save, Esc to cancel
              </p>
            </div>
          ) : (
            <pre
              className="p-3 text-sm font-mono text-gray-800 whitespace-pre-wrap cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsEditingContent(true)}
              title="Click to edit"
            >
              {file.fileContent || "(empty)"}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

const FileManager = ({
  skillSlug,
  files: initialFiles,
}: {
  skillSlug: string;
  files: SkillFile[];
}) => {
  const [files, setFiles] = useState<SkillFile[]>(initialFiles);
  const [isAdding, setIsAdding] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");

  const handleAddFile = async () => {
    if (!newFileName.trim() || !newFileContent.trim()) return;

    try {
      const response = await fetch(
        routes.skills.api.show.action.href({ slug: skillSlug }),
        {
          method: "POST",
          body: JSON.stringify({
            addFile: { fileName: newFileName, fileContent: newFileContent },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files ?? []);
        setNewFileName("");
        setNewFileContent("");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Failed to add file:", error);
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      const response = await fetch(
        routes.skills.api.show.action.href({ slug: skillSlug }),
        {
          method: "POST",
          body: JSON.stringify({ removeFileId: fileId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files ?? []);
      }
    } catch (error) {
      console.error("Failed to remove file:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
        Bundled Files ({files.length})
      </span>
      {files.length > 0 && (
        <div className="space-y-2 mb-4">
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              skillSlug={skillSlug}
              onUpdate={setFiles}
              onRemove={handleRemoveFile}
            />
          ))}
        </div>
      )}
      {isAdding ? (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="File name (e.g. scripts/fill_form.py)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            autoFocus
          />
          <textarea
            value={newFileContent}
            onChange={(e) => setNewFileContent(e.target.value)}
            placeholder="File content..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-vertical"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddFile}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              Add File
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewFileName("");
                setNewFileContent("");
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="self-start text-sm text-indigo-600 hover:text-indigo-800 underline"
        >
          + Add File
        </button>
      )}
    </div>
  );
};

const SkillDisplay = ({
  skillPromise,
}: {
  skillPromise: Promise<{
    id: string;
    name: string;
    slug: string;
    description: string;
    content: string;
    createdAt: string;
    userId: string;
    files: SkillFile[];
  }>;
}) => {
  const skillData = use(skillPromise);
  const skill = new Skill(
    skillData.id,
    skillData.name,
    skillData.slug,
    skillData.description,
    skillData.content,
    new Date(skillData.createdAt),
    skillData.userId,
    skillData.files ?? []
  );

  const [currentName, setCurrentName] = useState(skill.name);
  const [currentDescription, setCurrentDescription] = useState(
    skill.description
  );
  const [currentContent, setCurrentContent] = useState(skill.content);

  const nameField = useEditableField(skill.slug, "name", currentName, {
    name: currentName,
    description: currentDescription,
    content: currentContent,
  });

  const descriptionField = useEditableField(
    skill.slug,
    "description",
    currentDescription,
    {
      name: currentName,
      description: currentDescription,
      content: currentContent,
    }
  );

  const contentField = useEditableField(
    skill.slug,
    "content",
    currentContent,
    {
      name: currentName,
      description: currentDescription,
      content: currentContent,
    }
  );

  const handleNameSave = async () => {
    const oldName = currentName;
    setCurrentName(nameField.value);
    await nameField.handleSave();
    if (nameField.value !== oldName) {
      setCurrentName(nameField.value);
    }
  };

  const handleDescriptionSave = async () => {
    const oldDesc = currentDescription;
    setCurrentDescription(descriptionField.value);
    await descriptionField.handleSave();
    if (descriptionField.value !== oldDesc) {
      setCurrentDescription(descriptionField.value);
    }
  };

  const handleContentSave = async () => {
    const oldContent = currentContent;
    setCurrentContent(contentField.value);
    await contentField.handleSave();
    if (contentField.value !== oldContent) {
      setCurrentContent(contentField.value);
    }
  };

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    const confirmed = confirm(
      "Are you sure you want to delete this skill? This action cannot be undone."
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
            label="Description"
            value={descriptionField.value}
            isEditing={descriptionField.isEditing}
            isSaving={descriptionField.isSaving}
            onEdit={() => descriptionField.setIsEditing(true)}
            onChange={descriptionField.setValue}
            onSave={handleDescriptionSave}
            onCancel={descriptionField.handleCancel}
            multiline={true}
          />
          <EditableField
            label="Content (SKILL.md body)"
            value={contentField.value}
            isEditing={contentField.isEditing}
            isSaving={contentField.isSaving}
            onEdit={() => contentField.setIsEditing(true)}
            onChange={contentField.setValue}
            onSave={handleContentSave}
            onCancel={contentField.handleCancel}
            multiline={true}
          />
          <FileManager skillSlug={skill.slug} files={skill.files} />
          <CreatedAt date={skill.createdAt} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-8 gap-4">
        <a
          href={routes.skills.index.href()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
        >
          &larr; Back to Skills
        </a>

        <form
          method="post"
          action={routes.skills.destroy.href({ id: skill.id })}
          onSubmit={handleDelete}
        >
          <input type="hidden" name="_method" value="DELETE" />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm hover:shadow"
          >
            Delete Skill
          </button>
        </form>
      </div>
    </div>
  );
};

const SkillView = ({ slug }: { slug: string }) => {
  const skillPromise = useMemo(() => getSkill(slug), [slug]);

  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading skill...</span>
            </div>
          </div>
        </div>
      }
    >
      <SkillDisplay skillPromise={skillPromise} />
    </Suspense>
  );
};

// Extract skill slug from URL
const getSkillSlugFromUrl = () => {
  const match = routes.skills.show.match(window.location.toString());
  return match?.params?.slug ?? null;
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const slug = getSkillSlugFromUrl();
  if (slug) {
    const root = createRoot(rootElement);
    root.render(<SkillView slug={slug} />);
  } else {
    console.error("No skill slug found in URL");
  }
}
