import React from "react";
import { Layout } from "../../layouts/Layout";
import { routes } from "../../routes";

export function New({ userName }: { userName?: string | null }) {
  return (
    <Layout activeNav="rules" userName={userName}>
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-gray-900 font-mono">
              Create New Rule
            </h2>
            <a
              href={routes.rules.index.href()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
            >
              ← Back to Rules
            </a>
          </div>
          <p className="text-gray-600">Define custom rules for your profiles</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <form method="post" action={routes.rules.create.href()}>
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Rule Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Enter rule name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Content
              </label>
              <textarea
                id="content"
                name="content"
                rows={8}
                required
                placeholder="Enter rule content"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
              >
                Create Rule
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
