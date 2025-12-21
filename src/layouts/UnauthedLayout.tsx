import React from "react";
import { Document } from "./Layout";
export function UnauthedLayout({
  children,
  assets,
  title = "Guide My AI",
  activeNav,
  userId,
}: {
  children?: React.ReactNode;
  assets?: { scripts: string[] };
  title?: string;
  activeNav?: string;
  userId?: string | null;
}) {
  return (
    <Document assets={assets} title={title}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h2 className="font-bold text-gray-900">Guide My AI</h2>
                <p className="text-xs text-gray-500 font-mono">~/config</p>
              </div>
            </div>
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
