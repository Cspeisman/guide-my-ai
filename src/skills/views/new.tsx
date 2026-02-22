import { UserContext } from "../../auth/user-context";
import { Layout } from "../../layouts/Layout";
import { routes } from "../../routes";

export function New({ user }: { user: UserContext }) {
  return (
    <Layout activeNav="skills" user={user}>
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-gray-900 font-mono">
              Create New Skill
            </h2>
            <a
              href={routes.skills.index.href()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
            >
              &larr; Back to Skills
            </a>
          </div>
          <p className="text-gray-600">
            Create a new skill with a SKILL.md body and optional bundled files
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <form method="post" action={routes.skills.create.href()}>
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Skill Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="my-skill-name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">
                Lowercase letters, numbers, and hyphens only (max 64 chars)
              </p>
            </div>
            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                placeholder="A brief description of what this skill does"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
              <p className="mt-2 text-sm text-gray-500">
                Max 1024 characters
              </p>
            </div>
            <div className="mb-6">
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Content (SKILL.md body)
              </label>
              <textarea
                id="content"
                name="content"
                rows={10}
                placeholder="Write the skill instructions in markdown..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
              >
                Create Skill
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
