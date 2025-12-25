import { describe, test, expect } from "bun:test";
import { validateMcpContext } from "./validate-mcp-context";

describe("validateMcpContext", () => {
  test("rejects invalid JSON", () => {
    const result = validateMcpContext("not valid json");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Context must be valid JSON");
  });

  test("rejects JSON without mcpServers", () => {
    const result = validateMcpContext(
      JSON.stringify({ someOtherKey: "value" })
    );
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Context must contain an 'mcpServers' object");
  });

  test("rejects JSON with null mcpServers", () => {
    const result = validateMcpContext(JSON.stringify({ mcpServers: null }));
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Context must contain an 'mcpServers' object");
  });

  test("rejects JSON with mcpServers as array", () => {
    const result = validateMcpContext(JSON.stringify({ mcpServers: [] }));
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Context must contain an 'mcpServers' object");
  });

  test("rejects JSON with empty mcpServers object", () => {
    const result = validateMcpContext(JSON.stringify({ mcpServers: {} }));
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Context must contain at least one MCP server in 'mcpServers'"
    );
  });

  test("accepts valid mcpServers with one server", () => {
    const validContext = JSON.stringify({
      mcpServers: {
        "my-server": {
          command: "node",
          args: ["server.js"],
        },
      },
    });
    const result = validateMcpContext(validContext);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("accepts valid mcpServers with multiple servers", () => {
    const validContext = JSON.stringify({
      mcpServers: {
        "server-1": { command: "node", args: ["server1.js"] },
        "server-2": { command: "python", args: ["server2.py"] },
      },
    });
    const result = validateMcpContext(validContext);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("accepts mcpServers with complex nested payload", () => {
    const validContext = JSON.stringify({
      mcpServers: {
        "complex-server": {
          command: "node",
          args: ["server.js"],
          env: {
            API_KEY: "secret",
            PORT: "3000",
          },
          metadata: {
            version: "1.0.0",
            description: "A complex server config",
          },
        },
      },
    });
    const result = validateMcpContext(validContext);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
