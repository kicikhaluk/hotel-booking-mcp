import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./mcp.js";

async function main() {
  // 1. Initialize the StdioServerTransport
  // This tells the server to communicate over stdin/stdout
  const transport = new StdioServerTransport();

  // 2. Create the MCP server instance
  // This uses the function we defined in mcp.ts
  const server = createServer();

  // 3. Connect the server to the transport and start listening
  // The server is now ready to accept MCP requests
  await server.connect(transport);

  // Log a message to stderr to indicate the server is running
  // (stderr is used for logs so it doesn't interfere with stdout communication)
  console.error("Hotel Booking MCP Server running on stdio");
}

// Standard Node.js pattern to run the main function and catch errors
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1); // Exit with an error code if something goes wrong
});