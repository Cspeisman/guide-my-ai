import React from "react";

// Generic editable field component
export const EditableField = ({
  label,
  value,
  isEditing,
  isSaving,
  onEdit,
  onChange,
  onSave,
  onCancel,
  multiline = false,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  multiline?: boolean;
}) => {
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Escape") {
      onCancel();
    } else if (e.key === "Enter" && !multiline) {
      e.currentTarget.blur();
    } else if (multiline && e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.currentTarget.blur();
    }
  };

  // Calculate rows based on content newlines, with a minimum of 3
  const lineCount = value.split("\n").length;
  const rows = Math.max(lineCount, 3);

  return (
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
        {label}
      </span>
      {isEditing ? (
        multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onSave}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={isSaving}
            rows={rows}
            className="text-gray-800 bg-gray-50 p-4 rounded-lg leading-relaxed whitespace-pre-wrap font-mono text-sm border-2 border-blue-500 focus:outline-none focus:border-blue-600 resize-vertical"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onSave}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={isSaving}
            className="text-gray-800 font-semibold bg-gray-50 p-3 rounded-lg border-2 border-blue-500 focus:outline-none focus:border-blue-600"
          />
        )
      ) : multiline ? (
        <pre
          className="text-gray-800 bg-gray-50 p-4 rounded-lg leading-relaxed whitespace-pre-wrap font-mono text-sm cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={onEdit}
        >
          {value}
        </pre>
      ) : (
        <span
          className="text-gray-800 font-semibold bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={onEdit}
        >
          {value}
        </span>
      )}
    </div>
  );
};
