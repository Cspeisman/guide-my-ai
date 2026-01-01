import { ArrowLeft, Download } from "lucide-react";
import { Layout } from "../../layouts/Layout";
import { Profile } from "../../profiles/profile";
import { CreatedAt } from "../../utils/created-at";
import { routes } from "../../routes";
import { UserContext } from "../../auth/user-context";
import { User } from "better-auth";

export const UserProfile = (props: {
  profile: Profile;
  currentUser: UserContext;
  user: User;
}) => {
  return (
    <Layout activeNav="profiles" user={props.currentUser}>
      <div className="mb-4">
        <a
          href={routes.users.show.href({
            user: props.user.name,
          })}
          className="inline-flex items-center gap-2 underline  hover:text-indigo-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{props.user.name}'s Dashboard</span>
        </a>
      </div>
      <div>
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-mono mb-2">
                {props.profile.name}
              </h1>
              <div className="flex gap-3 items-center">
                <CreatedAt date={props.profile.createdAt} />
                <span className="text-[10px] text-gray-400">|</span>
                <div className="text-[10px] text-gray-400 font-mono">
                  updated: {props.profile.updatedAt.toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                title="Download profile"
                data-action="download-profile"
                data-profile={JSON.stringify({
                  name: props.profile.name,
                  createdAt: props.profile.createdAt,
                  updatedAt: props.profile.updatedAt,
                  mcps: props.profile.mcps,
                  rules: props.profile.rules,
                })}
                className="p-2 px-3 rounded-lg bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm hover:shadow"
              >
                <Download size={16} width={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Rules Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Rules ({props.profile.rules.length})
          </h2>
          {props.profile.rules.length > 0 ? (
            <div className="space-y-4">
              {props.profile.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    {rule.name}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {rule.content.length > 200
                        ? rule.content.substring(0, 200) + "..."
                        : rule.content}
                    </p>
                  </div>
                  <a
                    href={routes.users.rule.href({
                      user: props.user.name ?? "",
                      id: rule.id,
                    })}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-3 inline-block font-medium"
                  >
                    View Details →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
              <p className="text-gray-500">
                No rules associated with this profile.
              </p>
            </div>
          )}
        </div>

        {/* MCPs Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            MCPs ({props.profile.mcps.length})
          </h2>
          {props.profile.mcps.length > 0 ? (
            <div className="space-y-4">
              {props.profile.mcps.map((mcp) => (
                <div
                  key={mcp.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {mcp.name}
                  </h3>
                  <a
                    href={routes.users.mcp.href({
                      user: props.user.name ?? "",
                      id: mcp.id,
                    })}
                    className="text-sm text-blue-600 hover:text-blue-800 inline-block font-medium"
                  >
                    View Details →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
              <p className="text-gray-500">
                No MCPs associated with this profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
