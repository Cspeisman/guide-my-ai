import type { RequestContext } from "@remix-run/fetch-router";
import { userIdKey, userNameKey } from "./auth/auth-middleware";
import { Layout } from "./layouts/Layout";
import { UnauthedLayout } from "./layouts/UnauthedLayout";
import { render } from "./utils";
import { Info } from "lucide-react";

export const aboutHandler = () => {
  return {
    async about(context: RequestContext) {
      const userId = context.storage.get(userIdKey);
      const userName = context.storage.get(userNameKey);

      const content = (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Info className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900 font-mono">
              About Guide My AI
            </h1>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Mission
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Guide My AI offers a centralized place to store and manage all
                your local AI context, such as rules/instructions and MCP
                servers. You can assign them to various profiles to help support
                a variety of types of projects you may be working on.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Key Features
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="flex gap-3 items-start">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Profiles</h3>
                    <p className="text-sm text-gray-500">
                      Create distinct personalities and rule sets for different
                      contexts.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Rules</h3>
                    <p className="text-sm text-gray-500">
                      Define clear instructions and behaviors for your AI to
                      follow.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">MCP Servers</h3>
                    <p className="text-sm text-gray-500">
                      Integration with external tools and context providers via
                      MCP.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Editor Extensions
                    </h3>
                    <p className="text-sm text-gray-500">
                      Extensions for{" "}
                      <a
                        href="vscode:extension/GuideMyAI.guide-my-ai-extension"
                        className="text-blue-600"
                      >
                        VS Code
                      </a>
                      ,{" "}
                      <a
                        className="text-blue-600"
                        href="cursor:extension/GuideMyAI.guide-my-ai-extension"
                      >
                        Cursor
                      </a>
                      , and{" "}
                      <a
                        className="text-blue-600"
                        href="antigravity:extension/GuideMyAI.guide-my-ai-extension"
                      >
                        Antigravity
                      </a>{" "}
                      to quickly pull in your profile, rules, or MCP servers.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Open Source</h3>
                    <p className="text-sm text-gray-500">
                      This project is open source. View the code on{" "}
                      <a
                        href="https://github.com/Cspeisman/guide-my-ai"
                        className="text-blue-600 underline"
                      >
                        GitHub
                      </a>
                      .
                    </p>
                  </div>
                </li>
              </ul>
            </section>

            <section className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 text-center">
                © {new Date().getFullYear()} Guide My AI. All rights reserved.
              </p>
            </section>
          </div>
        </div>
      );

      if (userId) {
        return render(
          <Layout activeNav="about" userName={userName}>
            {content}
          </Layout>
        );
      } else {
        return render(
          <UnauthedLayout activeNav="about">{content}</UnauthedLayout>
        );
      }
    },
  };
};
