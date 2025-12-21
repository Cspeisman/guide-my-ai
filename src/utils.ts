import { join } from "path";
import { createHtmlResponse } from "@remix-run/response/html";
import { renderToString } from "react-dom/server";

// Helper function to render a React component to HTML and return an HTML response
export function render(component: React.ReactElement): Response {
  const html = renderToString(component);
  return createHtmlResponse(html);
}

// Helper function to serve static files (JS, CSS, etc.)
export async function serveStaticFile(
  request: Request,
  baseDir?: string
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const filepath = url.pathname.slice(1);
    const base = baseDir ?? process.cwd();
    const filePath = join(base, "dist", filepath);
    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      return new Response("File not found", { status: 404 });
    }

    // Determine content type based on file extension
    const ext = filepath.split(".").pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      js: "application/javascript",
      css: "text/css",
      json: "application/json",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      svg: "image/svg+xml",
      ico: "image/x-icon",
    };

    const contentType = contentTypeMap[ext || ""] || "application/octet-stream";

    return new Response(file, {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    return new Response("File not found", { status: 404 });
  }
}
