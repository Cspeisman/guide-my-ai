import React from "react";
import { Layout } from "../../layouts/Layout";
import { routes } from "../../routes";

export function New({ userName }: { userName?: string | null }) {
  return (
    <Layout activeNav="profiles" userName={userName}>
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-gray-900 font-mono">
              Create New Profile
            </h2>
            <a
              href={routes.profiles.index.href()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
            >
              ← Back to Profiles
            </a>
          </div>
          <p className="text-gray-600">
            Create a profile and assign MCPs and Rules to it
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <form method="post" action={routes.profiles.create.href()}>
            <div className="mb-6">
              <label
                htmlFor="profileName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Profile Name
              </label>
              <input
                name="name"
                type="text"
                id="profileName"
                placeholder="Enter profile name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                autoFocus
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
              >
                Create Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
