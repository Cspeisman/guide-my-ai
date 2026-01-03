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
  disabled = false,
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
  disabled?: boolean;
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

  // Generate a unique ID for the field based on the label
  const fieldId = `editable-field-${label.toLowerCase()}`;

  return (
    <div className="flex flex-col">
      <label
        htmlFor={fieldId}
        className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2"
      >
        {label}
      </label>
      {isEditing ? (
        multiline ? (
          <textarea
            id={fieldId}
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
            id={fieldId}
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
          id={fieldId}
          className={`text-gray-800 bg-gray-50 p-4 rounded-lg leading-relaxed whitespace-pre-wrap font-mono text-sm transition-colors cursor-pointer ${
            disabled ? "opacity-75" : "hover:bg-gray-100"
          }`}
          onClick={disabled ? undefined : onEdit}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              onEdit();
            }
          }}
        >
          {value}
        </pre>
      ) : (
        <span
          id={fieldId}
          className={`text-gray-800 font-semibold bg-gray-50 p-3 rounded-lg transition-colors cursor-pointer ${
            disabled ? "opacity-75" : "hover:bg-gray-100"
          }`}
          onClick={disabled ? undefined : onEdit}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              onEdit();
            }
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
};
