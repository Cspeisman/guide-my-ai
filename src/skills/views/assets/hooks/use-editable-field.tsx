import { useState } from "react";
import { routes } from "../../../../routes";

// Custom hook for managing editable field state for skills
export const useEditableField = (
  slug: string,
  fieldName: "name" | "description" | "content",
  initialValue: string,
  allFields: { name: string; description: string; content: string }
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
        routes.skills.api.show.action.href({ slug: slug }),
        {
          method: "POST",
          body: JSON.stringify({
            ...allFields,
            [fieldName]: value,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update skill ${fieldName}`);
      }
    } catch (error) {
      console.error(`Error updating skill ${fieldName}:`, error);
      setValue(initialValue);
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
