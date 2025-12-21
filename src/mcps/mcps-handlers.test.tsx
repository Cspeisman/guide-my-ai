import { describe, test, expect, beforeEach, mock } from "bun:test";
import { mcpsHandlers } from "./mcps-handlers";
import { Mcp } from "./mcp";

describe("mcpsHandlers", () => {
  const mockMcpsRepository = {
    getMcpsByUserId: mock(() => Promise.resolve([])),
    getMcpById: mock(() => Promise.resolve(null)),
    createMcp: mock(() => Promise.resolve(new Mcp("1", "Test", "{}", new Date()))),
    updateMcp: mock(() => Promise.resolve(new Mcp("1", "Updated", "{}", new Date()))),
  };

  beforeEach(() => {
    mockMcpsRepository.getMcpsByUserId.mockClear();
    mockMcpsRepository.getMcpById.mockClear();
    mockMcpsRepository.createMcp.mockClear();
    mockMcpsRepository.updateMcp.mockClear();
  });

  test("api.action validates JSON context", async () => {
    const context = {
      request: {
        json: async () => ({ name: "Test", context: "invalid json" }),
      },
      params: { id: "1" },
      storage: new Map(),
    };

    const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
    const response = await handlers.api.action(context as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Context must be valid JSON");
  });

  test("api.action updates mcp with valid JSON", async () => {
    const validJson = JSON.stringify({ key: "value" });
    const context = {
      request: {
        json: async () => ({ name: "Test", context: validJson }),
      },
      params: { id: "1" },
      storage: new Map(),
    };

    mockMcpsRepository.updateMcp.mockResolvedValueOnce(
      new Mcp("1", "Test", validJson, new Date())
    );

    const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
    const response = await handlers.api.action(context as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.context).toBe(validJson);
  });
});

