import { UserContext } from "../../auth/user-context";
import { Layout } from "../../layouts/Layout";
import { routes } from "../../routes";
import { User } from "../users-repository";

interface UserSettingsProps {
  user: User;
  error?: string;
  success?: string;
}

export function UserSettings({ user, error, success }: UserSettingsProps) {
  const userContext: UserContext = {
    userId: user.id,
    githubUrl: user.githubUrl ?? "",
    githubUsername: user.githubUsername ?? "",
    userName: user.name,
  };

  return (
    <Layout user={userContext}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 font-mono mb-2">
            Account Settings
          </h2>
          <p className="text-gray-600">Update your account information</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <form
            method="post"
            action={routes.users.settings.action.href({
              id: user.id ?? "",
            })}
          >
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={user.name ?? ""}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">
                This is your public username that will be displayed across the
                site
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                disabled
                value={user.email ?? ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-2 text-sm text-gray-500">
                Email cannot be changed at this time
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-semibold text-gray-700 mb-1">
                    Profile Privacy
                  </span>
                  <p className="text-sm text-gray-500">
                    When private, your profile and content will only be visible
                    to you
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="private"
                    name="private"
                    defaultChecked={user.private}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
              >
                Save Changes
              </button>
              <a
                href={routes.dashboard.href()}
                className="px-6 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
