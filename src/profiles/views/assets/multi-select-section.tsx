import { useState } from "react";
import Select, { MultiValue } from "react-select";
import { X } from "lucide-react";

interface BaseItem {
  id: string;
  name: string;
}

interface SelectOption<T extends BaseItem> {
  value: string;
  label: string;
  item: T;
}

interface MultiSelectSectionProps<T extends BaseItem> {
  title: string;
  items: T[];
  fetchEndpoint: string;
  onItemsChange: (items: T[]) => void;
  isSaving: boolean;
  placeholder?: string;
}

export const MultiSelectSection = <T extends BaseItem>({
  title,
  items,
  fetchEndpoint,
  onItemsChange,
  isSaving,
  placeholder = `Search and add ${title}...`,
}: MultiSelectSectionProps<T>) => {
  const [options, setOptions] = useState<SelectOption<T>[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Load items when menu opens
  const handleMenuOpen = async () => {
    if (options.length === 0) {
      setIsLoadingOptions(true);
      try {
        const response = await fetch(fetchEndpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${title}`);
        }
        const data: T[] = await response.json();
        const selectOptions = data.map((item) => ({
          value: String(item.id),
          label: item.name,
          item,
        }));
        setOptions(selectOptions);
      } catch (error) {
        console.error(`Failed to load ${title}:`, error);
        setOptions([]);
      } finally {
        setIsLoadingOptions(false);
      }
    }
  };

  // Handle selection change
  const handleChange = (selectedOptions: MultiValue<SelectOption<T>>) => {
    const selectedItems: T[] = selectedOptions.map((option) => option.item);
    onItemsChange(selectedItems);
  };

  // Handle removing an item
  const handleRemove = (itemId: string) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    onItemsChange(updatedItems);
  };

  // Get selected values
  const selectedValues: SelectOption<T>[] = items.map((item) => ({
    value: String(item.id),
    label: item.name,
    item,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      {/* Multi-Select */}
      <div className="mb-4">
        <Select
          isMulti
          options={options}
          onMenuOpen={handleMenuOpen}
          value={selectedValues}
          onChange={handleChange}
          placeholder={placeholder}
          isDisabled={isSaving}
          isLoading={isLoadingOptions}
          controlShouldRenderValue={false}
          isClearable={false}
          className="react-select-container"
          classNamePrefix="react-select"
          styles={{
            control: (base) => ({
              ...base,
              padding: "4px",
              borderRadius: "0.5rem",
              borderColor: "#d1d5db",
              "&:hover": {
                borderColor: "#9ca3af",
              },
            }),
          }}
        />
      </div>

      {/* Selected Items List */}
      {items.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Selected {title} ({items.length})
          </h4>
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="text-sm font-medium text-gray-900">
                  {item.name}
                </span>
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={isSaving}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-1 transition-colors disabled:opacity-50"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
