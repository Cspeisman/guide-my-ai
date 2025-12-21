import { render, screen, fireEvent } from "@testing-library/react";
import { test, expect, mock } from "bun:test";
import React from "react";
import { EditableField } from "./editable-field";

test("EditableField - single line input happy path: click, edit, and save", () => {
  const onEdit = mock(() => {});
  const onChange = mock(() => {});
  const onSave = mock(() => {});
  const onCancel = mock(() => {});

  // Initially render in non-editing mode
  const { rerender } = render(
    <EditableField
      label="Test Field"
      value="initial value"
      isEditing={false}
      isSaving={false}
      onEdit={onEdit}
      onChange={onChange}
      onSave={onSave}
      onCancel={onCancel}
      multiline={false}
    />
  );

  // Step 1: Click on the field to start editing
  const displaySpan = screen.getByText("initial value");
  fireEvent.click(displaySpan);
  expect(onEdit).toHaveBeenCalledTimes(1);

  // Step 2: Re-render in editing mode
  rerender(
    <EditableField
      label="Test Field"
      value="initial value"
      isEditing={true}
      isSaving={false}
      onEdit={onEdit}
      onChange={onChange}
      onSave={onSave}
      onCancel={onCancel}
      multiline={false}
    />
  );

  // Step 3: Edit the field value
  const input = screen.getByRole("textbox") as HTMLInputElement;
  fireEvent.change(input, { target: { value: "updated value" } });
  expect(onChange).toHaveBeenCalledWith("updated value");

  // Step 4: Blur the input to save
  fireEvent.blur(input);
  expect(onSave).toHaveBeenCalledTimes(1);
});
