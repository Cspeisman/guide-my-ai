import { useState } from "react";
import { routes } from "../../../../routes";

// Custom hook for managing editable field state
export const useEditableField = (
  ruleId: string,
  fieldName: "name" | "content",
  initialValue: string,
  allFields: { name: string; content: string }
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (value === initialValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        routes.rules.api.action.href({ id: ruleId }),
        {
          method: "POST",
          body: JSON.stringify({
            ...allFields,
            [fieldName]: value,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update rule ${fieldName}`);
      }
    } catch (error) {
      console.error(`Error updating rule ${fieldName}:`, error);
      setValue(initialValue); // Reset to original value on error
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  return {
    isEditing,
    value,
    isSaving,
    setIsEditing,
    setValue,
    handleSave,
    handleCancel,
  };
};
