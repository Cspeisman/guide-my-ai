import { describe, test, expect, beforeEach, mock, it } from "bun:test";
import { mcpsHandlers } from "./mcps-handlers";
import { Mcp } from "./mcp";
import { userIdKey, userNameKey } from "../auth/auth-middleware";
import { AppStorage } from "@remix-run/fetch-router";
import { McpsRepository } from "./mcps-repository";

class FakeMcpsRepository extends McpsRepository {
  mcps: Mcp[];

  constructor(mcps: Mcp[]) {
    super();
    this.mcps = mcps;
  }

  async getMcpsByUserId(userId: string): Promise<Mcp[]> {
    return this.mcps.filter((m) => m.userId === userId);
  }

  async getMcpByIdAndUserId(id: string, userId: string): Promise<Mcp | null> {
    return this.mcps.find((m) => m.id === id && m.userId === userId) || null;
  }

  async getMcpBySlugAndUserId(
    slug: string,
    userId: string
  ): Promise<Mcp | null> {
    return (
      this.mcps.find((m) => m.slug === slug && m.userId === userId) || null
    );
  }

  async createMcp(data: {
    name: string;
    context: string;
    userId: string;
  }): Promise<Mcp> {
    const newMcp = new Mcp(
      "new-mcp-123",
      data.name,
      "test-slug",
      data.context,
      new Date(),
      data.userId
    );
    this.mcps.push(newMcp);
    return newMcp;
  }

  async updateMcp(mcp: Mcp): Promise<Mcp> {
    const index = this.mcps.findIndex((m) => m.id === mcp.id);
    if (index !== -1) {
      this.mcps[index] = mcp;
    }
    return mcp;
  }

  async deleteMcp(id: string, userId: string): Promise<void> {
    this.mcps = this.mcps.filter((m) => !(m.id === id && m.userId === userId));
  }

  async incrementDownloadCount(mcpId: string): Promise<void> {}
}

describe("mcpsHandlers", () => {
  const mockMcpsRepository = {
    getMcpsByUserId: mock(() => Promise.resolve([])),
    getMcpByIdAndUserId: mock(() => Promise.resolve(null as Mcp | null)),
    getMcpBySlugAndUserId: mock(() => Promise.resolve(null as Mcp | null)),
    createMcp: mock(() =>
      Promise.resolve(new Mcp("1", "Test", "test", "{}", new Date(), "user123"))
    ),
    updateMcp: mock(() =>
      Promise.resolve(
        new Mcp("1", "Updated", "updated", "{}", new Date(), "user123")
      )
    ),
    deleteMcp: mock(() => Promise.resolve()),
    incrementDownloadCount: mock(() => Promise.resolve()),
    getMcpById: mock((id: string) =>
      Promise.resolve(new Mcp("id", "name", "slug", "", new Date(), "user-id"))
    ),
    getAllMcps: mock(() => Promise.resolve([])),
  };

  beforeEach(() => {
    mockMcpsRepository.getMcpsByUserId.mockClear();
    mockMcpsRepository.getMcpByIdAndUserId.mockClear();
    mockMcpsRepository.getMcpBySlugAndUserId.mockClear();
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

  describe("JSON validation", () => {
    test("validates JSON context", async () => {
      const context = createMockContext({
        userId: "user123",
        params: { slug: "test-slug" },
        request: {
          json: async () => ({ name: "Test", context: "invalid json" }),
        },
      });
      mockMcpsRepository.getMcpBySlugAndUserId = mock(() =>
        Promise.resolve(new Mcp("", "", "", "", new Date(), "user123"))
      );

      const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
      const response = await handlers.api.show.action(context as any);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("Context must be valid JSON");
    });
    test("validates mcpServers structure is present", async () => {
      const invalidContext = JSON.stringify({ someOtherKey: "value" });
      const context = createMockContext({
        userId: "user123",
        params: { slug: "test-slug" },
        request: {
          json: async () => ({ name: "Test", context: invalidContext }),
        },
      });

      mockMcpsRepository.getMcpBySlugAndUserId = mock(() =>
        Promise.resolve(new Mcp("", "", "", "", new Date(), "user123"))
      );
      const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
      const response = await handlers.api.show.action(context as any);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("Context must contain an 'mcpServers' object");
    });
    test("validates mcpServers contains at least one server", async () => {
      const invalidContext = JSON.stringify({ mcpServers: {} });
      const context = createMockContext({
        userId: "user123",
        params: { slug: "test-slug" },
        request: {
          json: async () => ({ name: "Test", context: invalidContext }),
        },
      });

      mockMcpsRepository.getMcpBySlugAndUserId = mock(() =>
        Promise.resolve(new Mcp("", "", "", "", new Date(), "user123"))
      );
      const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
      const response = await handlers.api.show.action(context as any);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe(
        "Context must contain at least one MCP server in 'mcpServers'"
      );
    });
  });

  test("updates mcp with valid JSON", async () => {
    const validJson = JSON.stringify({
      mcpServers: { "test-server": { command: "test" } },
    });
    const createdAt = new Date();
    const context = createMockContext({
      userId: "user123",
      params: { slug: "old-name" },
      request: {
        json: async () => ({ name: "Test", context: validJson }),
      },
    });

    // Mock getMcpBySlug to return an existing MCP
    mockMcpsRepository.getMcpBySlugAndUserId.mockResolvedValueOnce(
      new Mcp("1", "Old Name", "old-name", "{}", createdAt, "user123")
    );

    // Mock updateMcp to return the updated MCP
    mockMcpsRepository.updateMcp.mockResolvedValueOnce(
      new Mcp("1", "Test", "test", validJson, createdAt, "user123")
    );

    const handlers = mcpsHandlers({ mcpsRepository: mockMcpsRepository });
    const response = await handlers.api.show.action(context as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.context).toBe(validJson);
    expect(json.name).toBe("Test");
    expect(mockMcpsRepository.updateMcp).toHaveBeenCalled();
  });

  test("validates mcpServers structure when creating mcp", async () => {
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

  describe("Authorization", () => {
    it("prevents user from viewing another user's mcp", async () => {
      const otherUsersMcp = new Mcp(
        "mcp-999",
        "Other User's MCP",
        "other-users-mcp",
        "{}",
        new Date(),
        "other-user-id"
      );
      const fakeRepository = new FakeMcpsRepository([otherUsersMcp]);
      const handlers = mcpsHandlers({
        mcpsRepository: fakeRepository as any,
      });

      const context = createMockContext({
        userId: "user123",
        params: { slug: "other-users-mcp" },
      });

      const response = await handlers.show(context as any);
      const text = await response.text();
      expect(text).toContain("Sorry we were unable to find mcp with ID");
    });

    it("prevents user from viewing another user's mcp via API", async () => {
      const otherUsersMcp = new Mcp(
        "mcp-999",
        "Other User's MCP",
        "other-users-mcp",
        "{}",
        new Date(),
        "other-user-id"
      );
      const fakeRepository = new FakeMcpsRepository([otherUsersMcp]);
      const handlers = mcpsHandlers({
        mcpsRepository: fakeRepository as any,
      });

      const context = createMockContext({
        userId: "user123",
        params: { slug: "other-users-mcp" },
      });

      const response = await handlers.api.show.index(context as any);
      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.msg).toContain(
        "unable to find the resource for current user"
      );
    });

    it("prevents user from updating another user's mcp via API", async () => {
      const validJson = JSON.stringify({
        mcpServers: { "test-server": { command: "test" } },
      });
      const otherUsersMcp = new Mcp(
        "mcp-999",
        "Other User's MCP",
        "other-users-mcp",
        "{}",
        new Date(),
        "other-user-id"
      );
      const fakeRepository = new FakeMcpsRepository([otherUsersMcp]);
      const handlers = mcpsHandlers({
        mcpsRepository: fakeRepository as any,
      });

      const request = new Request("http://localhost/api/mcps/mcp-999", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Hacked Name",
          context: validJson,
        }),
      });

      const context = createMockContext({
        userId: "user123",
        params: { slug: "other-users-mcp" },
        request,
      });

      const response = await handlers.api.show.action(context as any);
      expect(response.status).toBe(404);

      const json = await response.json();
      expect(json.msg).toContain("unable to update mcp");

      // Verify mcp was not modified
      const mcp = fakeRepository.mcps[0];
      expect(mcp.name).toBe("Other User's MCP");
      expect(mcp.context).toBe("{}");
    });

    it("prevents user from deleting another user's mcp", async () => {
      const otherUsersMcp = new Mcp(
        "mcp-999",
        "Other User's MCP",
        "other-users-mcp",
        "{}",
        new Date(),
        "other-user-id"
      );
      const fakeRepository = new FakeMcpsRepository([otherUsersMcp]);
      const handlers = mcpsHandlers({
        mcpsRepository: fakeRepository as any,
      });

      const formData = new FormData();
      formData.append("_method", "DELETE");

      const request = new Request("http://localhost/mcps/mcp-999", {
        method: "POST",
        body: formData,
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "mcp-999" },
        request,
      });

      const response = await handlers.destroy(context as any);
      const text = await response.text();
      expect(text).toContain("Sorry we were unable to find mcp with ID:");
    });
  });
});
