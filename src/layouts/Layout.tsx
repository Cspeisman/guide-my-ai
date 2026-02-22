import {
  Ellipsis,
  FileCode,
  FolderCode,
  LayoutDashboard,
  LogOut,
  Settings,
  Asterisk,
  Users,
} from "lucide-react";
import React from "react";
import type { UserContext } from "../auth/user-context";
import { IdeDownloadMenu } from "../components/IdeDownloadMenu";
import { TopNavBar } from "../components/TopNavBar";
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
        <link rel="icon" type="image/x-icon" href={routes.favicon.href()} />
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
  user,
}: {
  children?: React.ReactNode;
  assets?: { scripts: string[] };
  title?: string;
  activeNav?: string;
  user?: UserContext;
}) {
  return (
    <Document assets={assets} title={title}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <a href={routes.home.href()}>
                  <h2 className="font-bold text-gray-900">Guide My AI</h2>
                  {user?.userName && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">{user.userName}</span>
                      </p>
                    </div>
                  )}
                  {user?.githubUrl && user?.githubUsername && (
                    <a
                      href={user.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500  hover:text-gray-600 hover:underline mt-2 flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      {user.githubUsername}
                    </a>
                  )}
                </a>
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
              href={routes.skills.index.href()}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeNav === "skills"
                  ? "bg-indigo-50 text-indigo-900 border-l-2 border-indigo-500"
                  : "text-gray-700 hover:bg-gray-100 border-l-2 border-transparent"
              }`}
            >
              <Asterisk />
              <span className="font-medium">Skills</span>
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
            <a
              href={routes.community.index.href()}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeNav === "community"
                  ? "bg-indigo-50 text-indigo-900 border-l-2 border-indigo-500"
                  : "text-gray-700 hover:bg-gray-100 border-l-2 border-transparent"
              }`}
            >
              <Users />
              <span className="font-medium">Community</span>
            </a>
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <IdeDownloadMenu />
          </div>
        </aside>
        {/* Main Content */}
        <div className="flex-1 flex flex-col relative">
          <TopNavBar user={user} />
          <main className="flex-1 p-8">
            {children}
            <div id="root" />
          </main>
        </div>
      </div>
    </Document>
  );
}
