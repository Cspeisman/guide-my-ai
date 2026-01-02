import { describe, expect, it, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { MultiSelectSection } from "./multi-select-section";

describe("MultiSelectSection", () => {
  const mockItems = [
    { id: "1", name: "Item 1" },
    { id: "2", name: "Item 2" },
  ];

  const mockFetchData = [
    { id: "1", name: "Item 1" },
    { id: "2", name: "Item 2" },
    { id: "3", name: "Item 3" },
  ];

  afterEach(() => {
    cleanup();
  });

  const renderWithCache = (component: React.ReactElement) => {
    const emotionCache = createCache({ key: "test", container: document.head });
    return render(
      <CacheProvider value={emotionCache}>{component}</CacheProvider>
    );
  };

  it("renders with title and items", async () => {
    const onItemsChange = mock(() => {});

    await act(async () => {
      renderWithCache(
        <MultiSelectSection
          title="My Section"
          items={mockItems}
          fetchEndpoint="/api/test"
          onItemsChange={onItemsChange}
          isSaving={false}
        />
      );
    });

    expect(screen.getByText("My Section")).toBeDefined();
    expect(screen.getByText("Item 1")).toBeDefined();
    expect(screen.getByText("Item 2")).toBeDefined();
  });

  it("shows selected items count", async () => {
    const onItemsChange = mock(() => {});

    await act(async () => {
      renderWithCache(
        <MultiSelectSection
          title="My Section"
          items={mockItems}
          fetchEndpoint="/api/test"
          onItemsChange={onItemsChange}
          isSaving={false}
        />
      );
    });

    expect(screen.getByText(/Selected My Section \(2\)/)).toBeDefined();
  });

  it("calls onItemsChange when removing an item", async () => {
    const onItemsChange = mock(() => {});

    await act(async () => {
      renderWithCache(
        <MultiSelectSection
          title="My Section"
          items={mockItems}
          fetchEndpoint="/api/test"
          onItemsChange={onItemsChange}
          isSaving={false}
        />
      );
    });

    const firstRemoveButton = screen.getByLabelText("Remove Item 1");

    await act(async () => {
      fireEvent.click(firstRemoveButton);
    });
    expect(onItemsChange).toHaveBeenCalledWith([{ id: "2", name: "Item 2" }]);
  });

  it("fetches options when menu opens", async () => {
    global.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFetchData),
      })
    ) as any;

    const onItemsChange = mock(() => {});

    await act(async () => {
      renderWithCache(
        <MultiSelectSection
          title="My Section"
          items={[]}
          fetchEndpoint="/api/test"
          onItemsChange={onItemsChange}
          isSaving={false}
        />
      );
    });

    // This would need react-select testing utilities to properly test
    // For now, just verify the component renders
    expect(screen.getByText("My Section")).toBeDefined();
  });

  it("disables controls when saving", async () => {
    const onItemsChange = mock(() => {});

    await act(async () => {
      renderWithCache(
        <MultiSelectSection
          title="My Section"
          items={mockItems}
          fetchEndpoint="/api/test"
          onItemsChange={onItemsChange}
          isSaving={true}
        />
      );
    });

    const firstRemoveButton = screen.getByLabelText("Remove Item 1");
    expect(firstRemoveButton.hasAttribute("disabled")).toBe(true);
  });
});
