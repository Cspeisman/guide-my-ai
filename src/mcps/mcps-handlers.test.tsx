import { describe, test, expect, beforeEach, mock } from "bun:test";
import { mcpsHandlers } from "./mcps-handlers";
import { Mcp } from "./mcp";
import { userIdKey, userNameKey } from "../auth/auth-middleware";
import { AppStorage } from "@remix-run/fetch-router";

describe("mcpsHandlers", () => {
  const mockMcpsRepository = {
    getMcpsByUserId: mock(() => Promise.resolve([])),
    getMcpById: mock(() => Promise.resolve(null as Mcp | null)),
    createMcp: mock(() =>
      Promise.resolve(new Mcp("1", "Test", "{}", new Date(), "user123"))
    ),
    updateMcp: mock(() =>
      Promise.resolve(new Mcp("1", "Updated", "{}", new Date(), "user123"))
    ),
    deleteMcp: mock(() => Promise.resolve()),
  };

  beforeEach(() => {
    mockMcpsRepository.getMcpsByUserId.mockClear();
    mockMcpsRepository.getMcpById.mockClear();
    mockMcpsRepository.createMcp.mockClear();
    mockMcpsRepository.updateMcp.mockClear();
  });

  function createMockContext(options: {
    userId?: string;
    params?: Record<string, string>;
    request?: any;
  }) {
    const storage = new AppStorage();
    if (options.userId) {
      storage.set(userIdKey, options.userId);
      storage.set(userNameKey, options.userId);
    }

    return {
      storage,
      params: options.params,
      request: options.request,
    };
  }

  test("api.action validates JSON context", async () => {
    const context = createMockContext({
      userId: "user123",
      params: { id: "1" },
      request: {
        json: async () => ({ name: "Test", context: "invalid json" }),
      },
    });
    mockMcpsRepository.getMcpById = mock(() =>
      Promise.resolve(new Mcp("", "", "", new Date(), "user123"))
    );

    const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
    const response = await handlers.api.show.action(context as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Context must be valid JSON");
  });

  test("api.action validates mcpServers structure is present", async () => {
    const invalidContext = JSON.stringify({ someOtherKey: "value" });
    const context = createMockContext({
      userId: "user123",
      params: { id: "1" },
      request: {
        json: async () => ({ name: "Test", context: invalidContext }),
      },
    });

    mockMcpsRepository.getMcpById = mock(() =>
      Promise.resolve(new Mcp("", "", "", new Date(), "user123"))
    );
    const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
    const response = await handlers.api.show.action(context as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Context must contain an 'mcpServers' object");
  });

  test("api.action validates mcpServers contains at least one server", async () => {
    const invalidContext = JSON.stringify({ mcpServers: {} });
    const context = createMockContext({
      userId: "user123",
      params: { id: "1" },
      request: {
        json: async () => ({ name: "Test", context: invalidContext }),
      },
    });

    mockMcpsRepository.getMcpById = mock(() =>
      Promise.resolve(new Mcp("", "", "", new Date(), "user123"))
    );
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
    const context = createMockContext({
      userId: "user123",
      params: { id: "1" },
      request: {
        json: async () => ({ name: "Test", context: validJson }),
      },
    });

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

    const context = createMockContext({
      userId: "user123",
      request: {
        formData: async () => formData,
      },
    });

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

    const context = createMockContext({
      userId: "user123",
      request: {
        formData: async () => formData,
      },
    });

    const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
    const response = await handlers.create(context as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe(
      "Context must contain at least one MCP server in 'mcpServers'"
    );
  });

  describe("Authorization", () => {
    test("prevents user from viewing another user's MCP", async () => {
      const otherUsersMcp = new Mcp(
        "mcp-999",
        "Other User's MCP",
        "{}",
        new Date(),
        "other-user-id"
      );
      mockMcpsRepository.getMcpById.mockResolvedValueOnce(otherUsersMcp);

      const context = createMockContext({
        userId: "user123",
        params: { id: "mcp-999" },
      });

      const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
      const response = await handlers.show(context as any);

      expect(response.status).toBe(403);
    });

    test("prevents user from viewing another user's MCP via API", async () => {
      const otherUsersMcp = new Mcp(
        "mcp-999",
        "Other User's MCP",
        "{}",
        new Date(),
        "other-user-id"
      );
      mockMcpsRepository.getMcpById.mockResolvedValueOnce(otherUsersMcp);

      const context = createMockContext({
        userId: "user123",
        params: { id: "mcp-999" },
      });

      const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
      const response = await handlers.api.show.index(context as any);

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toContain("permission");
    });

    test("prevents user from updating another user's MCP via API", async () => {
      const validJson = JSON.stringify({
        mcpServers: { "test-server": { command: "test" } },
      });
      const otherUsersMcp = new Mcp(
        "mcp-999",
        "Other User's MCP",
        "{}",
        new Date(),
        "other-user-id"
      );
      mockMcpsRepository.getMcpById.mockResolvedValueOnce(otherUsersMcp);

      const context = createMockContext({
        userId: "user123",
        params: { id: "mcp-999" },
        request: {
          json: async () => ({ name: "Hacked Name", context: validJson }),
        },
      });

      const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
      const response = await handlers.api.show.action(context as any);

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toContain("permission");

      // Verify updateMcp was not called
      expect(mockMcpsRepository.updateMcp).not.toHaveBeenCalled();
    });

    test("prevents user from deleting another user's MCP", async () => {
      const otherUsersMcp = new Mcp(
        "mcp-999",
        "Other User's MCP",
        "{}",
        new Date(),
        "other-user-id"
      );
      mockMcpsRepository.getMcpById.mockResolvedValueOnce(otherUsersMcp);

      const formData = new FormData();
      formData.append("_method", "DELETE");

      const context = createMockContext({
        userId: "user123",
        params: { id: "mcp-999" },
        request: {
          formData: async () => formData,
        },
      });

      const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
      const response = await handlers.destroy(context as any);

      expect(response.status).toBe(403);

      // Verify deleteMcp was not called
      expect(mockMcpsRepository.deleteMcp).not.toHaveBeenCalled();
    });

    test("allows user to view their own MCP", async () => {
      const usersMcp = new Mcp(
        "mcp-123",
        "User's MCP",
        "{}",
        new Date(),
        "user123"
      );
      mockMcpsRepository.getMcpById.mockResolvedValueOnce(usersMcp);

      const context = createMockContext({
        userId: "user123",
        params: { id: "mcp-123" },
      });

      const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
      const response = await handlers.show(context as any);

      expect(response.status).toBe(200);
    });
  });
});
