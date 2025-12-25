import { describe, test, expect, beforeEach, mock } from "bun:test";
import { mcpsHandlers } from "./mcps-handlers";
import { Mcp } from "./mcp";

describe("mcpsHandlers", () => {
  const mockMcpsRepository = {
    getMcpsByUserId: mock(() => Promise.resolve([])),
    getMcpById: mock(() => Promise.resolve(null as Mcp | null)),
    createMcp: mock(() =>
      Promise.resolve(new Mcp("1", "Test", "{}", new Date()))
    ),
    updateMcp: mock(() =>
      Promise.resolve(new Mcp("1", "Updated", "{}", new Date()))
    ),
    deleteMcp: mock(() => Promise.resolve()),
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
    const response = await handlers.api.show.action(context as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Context must be valid JSON");
  });

  test("api.action validates mcpServers structure is present", async () => {
    const invalidContext = JSON.stringify({ someOtherKey: "value" });
    const context = {
      request: {
        json: async () => ({ name: "Test", context: invalidContext }),
      },
      params: { id: "1" },
      storage: new Map(),
    };

    const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
    const response = await handlers.api.show.action(context as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Context must contain an 'mcpServers' object");
  });

  test("api.action validates mcpServers contains at least one server", async () => {
    const invalidContext = JSON.stringify({ mcpServers: {} });
    const context = {
      request: {
        json: async () => ({ name: "Test", context: invalidContext }),
      },
      params: { id: "1" },
      storage: new Map(),
    };

    const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
    const response = await handlers.api.show.action(context as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe(
      "Context must contain at least one MCP server in 'mcpServers'"
    );
  });

  test("api.action updates mcp with valid JSON", async () => {
    const validJson = JSON.stringify({
      mcpServers: { "test-server": { command: "test" } },
    });
    const createdAt = new Date();
    const context = {
      request: {
        json: async () => ({ name: "Test", context: validJson }),
      },
      params: { id: "1" },
      storage: new Map(),
    };

    // Mock getMcpById to return an existing MCP
    mockMcpsRepository.getMcpById.mockResolvedValueOnce(
      new Mcp("1", "Old Name", "{}", createdAt, "user123")
    );

    // Mock updateMcp to return the updated MCP
    mockMcpsRepository.updateMcp.mockResolvedValueOnce(
      new Mcp("1", "Test", validJson, createdAt, "user123")
    );

    const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
    const response = await handlers.api.show.action(context as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.context).toBe(validJson);
    expect(json.name).toBe("Test");
    expect(mockMcpsRepository.getMcpById).toHaveBeenCalledWith("1");
    expect(mockMcpsRepository.updateMcp).toHaveBeenCalled();
  });

  test("create validates mcpServers structure is present", async () => {
    const invalidContext = JSON.stringify({ someOtherKey: "value" });
    const formData = new FormData();
    formData.append("name", "Test MCP");
    formData.append("context", invalidContext);

    const context = {
      request: {
        formData: async () => formData,
      },
      storage: new Map([["userId", "user123"]]),
    };

    const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
    const response = await handlers.create(context as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Context must contain an 'mcpServers' object");
  });

  test("create validates mcpServers contains at least one server", async () => {
    const invalidContext = JSON.stringify({ mcpServers: {} });
    const formData = new FormData();
    formData.append("name", "Test MCP");
    formData.append("context", invalidContext);

    const context = {
      request: {
        formData: async () => formData,
      },
      storage: new Map([["userId", "user123"]]),
    };

    const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
    const response = await handlers.create(context as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe(
      "Context must contain at least one MCP server in 'mcpServers'"
    );
  });
});
