/**
 * Validates that the MCP context has the expected mcpServers structure
 */
export function validateMcpContext(contextString: string): {
  valid: boolean;
  error?: string;
} {
  // Validate that context is valid JSON
  let parsedContext;
  try {
    parsedContext = JSON.parse(contextString);
  } catch (e) {
    return { valid: false, error: "Context must be valid JSON" };
  }

  // Validate that context has the expected mcpServers structure
  if (
    !parsedContext.mcpServers ||
    typeof parsedContext.mcpServers !== "object" ||
    Array.isArray(parsedContext.mcpServers)
  ) {
    return {
      valid: false,
      error: "Context must contain an 'mcpServers' object",
    };
  }

  // Validate that mcpServers has at least one server defined
  if (Object.keys(parsedContext.mcpServers).length === 0) {
    return {
      valid: false,
      error: "Context must contain at least one MCP server in 'mcpServers'",
    };
  }

  return { valid: true };
}
