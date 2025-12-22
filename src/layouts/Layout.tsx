import {
  FileCode,
  FolderCode,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import React from "react";
import { routes } from "../routes";

export function Document({
  title = "Title",
  children,
  assets,
}: {
  title?: string;
  children: React.ReactNode;
  assets?: { scripts: string[] };
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link href={routes.css.href({ path: "output.css" })} rel="stylesheet" />
        {assets?.scripts.map((fileName) => (
          <script key={fileName} type="module" async src={`${fileName}.js`} />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}

export function Layout({
  children,
  assets,
  title = "Guide My AI",
  activeNav,
  userName,
}: {
  children?: React.ReactNode;
  assets?: { scripts: string[] };
  title?: string;
  activeNav?: string;
  userName?: string | null;
}) {
  return (
    <Document assets={assets} title={title}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h2 className="font-bold text-gray-900">Guide My AI</h2>
                <p className="text-xs text-gray-500 font-mono">~/config</p>
                {userName && (
                  <p className="text-xs text-gray-600 mt-1">
                    Logged in as <span className="font-medium">{userName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <a
              href={routes.home.href()}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeNav === "dashboard"
                  ? "bg-indigo-50 text-indigo-900 border-l-2 border-indigo-500"
                  : "text-gray-700 hover:bg-gray-100 border-l-2 border-transparent"
              }`}
            >
              <LayoutDashboard />
              <span className="font-medium">Dashboard</span>
            </a>
            <a
              href={routes.profiles.index.href()}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeNav === "profiles"
                  ? "bg-indigo-50 text-indigo-900 border-l-2 border-indigo-500"
                  : "text-gray-700 hover:bg-gray-100 border-l-2 border-transparent"
              }`}
            >
              <FolderCode />
              <span className="font-medium">Profiles</span>
            </a>
            <a
              href={routes.rules.index.href()}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeNav === "rules"
                  ? "bg-indigo-50 text-indigo-900 border-l-2 border-indigo-500"
                  : "text-gray-700 hover:bg-gray-100 border-l-2 border-transparent"
              }`}
            >
              <FileCode />
              <span className="font-medium">Rules</span>
            </a>
            <a
              href={routes.mcps.index.href()}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeNav === "mcps"
                  ? "bg-indigo-50 text-indigo-900 border-l-2 border-indigo-500"
                  : "text-gray-700 hover:bg-gray-100 border-l-2 border-transparent"
              }`}
            >
              <Settings />
              <span className="font-medium">MCPs</span>
            </a>
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-200">
            <form
              method={routes.auth.logout.method}
              action={routes.auth.logout.href()}
            >
              <button
                type="submit"
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-700 hover:bg-gray-100 hover:text-text-900 border-l-2 border-transparent w-full"
              >
                <LogOut size={10} />
                <span className="text-xs">Logout</span>
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8">
            {children}
            <div id="root" />
          </main>
        </div>
      </div>
    </Document>
  );
}
