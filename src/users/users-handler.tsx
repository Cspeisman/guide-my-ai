import { RequestContext } from "@remix-run/fetch-router";
import { routes } from "../routes";
import { UsersRepository } from "./users-repository";
import { render } from "../utils";
import { Layout } from "../layouts/Layout";
import { FileCode, Settings, User } from "lucide-react";
import { CreatedAt } from "../utils/created-at";
import { userIdKey } from "../auth/auth-middleware";

export const usersHandler = (usersRepository: UsersRepository) => {
    return async (context: RequestContext) => {
        const matches = routes.users.match(context.request.url);
        const userName = matches?.params.user;
        if (!userName) {
            return Response.json({ error: "Username is required" }, { status: 400 });
        }
        const currentUserId = context.storage.get(userIdKey);
        const result = await usersRepository.getProfilesByUsername(userName);
        const {userId, profiles} = result ?? {userId: null, profiles: []};
        const isCurrentUser = currentUserId !== null && userId !== null && currentUserId === userId;
        // Collect all rules from all profiles into a single usersRules array
        const userRules = profiles.flatMap(profile => profile.rules);
        // Collect all mcps from all profiles into a single userMcps array
        const userMcps = profiles.flatMap(profile => profile.mcps);
        return render(
            <Layout activeNav="dashboard" userName={userName}>
              <div className="space-y-8">
                {/* Dashboard Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-mono">
                      Dashboard
                    </h1>
                  </div>
                </div>

                {/* Profiles Section */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className=" text-gray-900 flex items-center gap-3">
                      <User className="h-4 w-4 text-green-500" /> Profiles
                    </div>
                    {isCurrentUser && (
                      <a
                        href={routes.profiles.new.href()}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium underline hover:bg-indigo-50 hover:text-indigo-900 transition-colors px-3 py-2"
                      >
                        + New Profile
                      </a>
                    )}
                  </div>
                  {profiles.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                      <p className="text-gray-600 mb-4">
                        No profiles yet. Create your first profile!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profiles.map((profile) => (
                        <a
                          key={profile.id}
                          href={routes.profiles.show.href({ id: profile.id })}
                          className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {profile.name}
                            </h3>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>
                              {profile.rules.length} rule
                              {profile.rules.length !== 1 ? "s" : ""}
                            </span>
                            <span>
                              {profile.mcps.length} MCP
                              {profile.mcps.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <CreatedAt
                            date={profile.createdAt}
                            className="mt-4"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rules Section */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className=" text-gray-900 flex items-center gap-3">
                      <FileCode className="h-4 w-4 text-blue-500" /> Rules
                    </div>
                    {isCurrentUser && (
                      <a
                        href={routes.rules.new.href()}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium underline hover:bg-indigo-50 hover:text-indigo-900 transition-colors px-3 py-2"
                      >
                        + New Rule
                      </a>
                    )}
                  </div>
                  {userRules.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                      <p className="text-gray-600 mb-4">
                        No rules yet. Create your first rule!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userRules.map((rule) => (
                        <a
                          key={rule.id}
                          href={routes.rules.show.href({ id: rule.id })}
                          className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {rule.name}
                            </h3>

                            <button className="text-gray-400 hover:text-gray-600 text-xl">
                              ⋮
                            </button>
                          </div>
                          <p className="bg-gray-50 whitespace-pre-wrap font-mono text-sm  p-4 rounded-lg">
                            {rule.content.length > 200
                              ? rule.content.substring(0, 200) + "..."
                              : rule.content}
                          </p>
                          <CreatedAt date={rule.createdAt} className="mt-4" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* MCPs Section */}
                <div className="mt-12">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className=" text-gray-900 flex items-center gap-3">
                        <Settings className="h-4 w-4 text-purple-500" /> MCPs
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {userMcps.length} configuration
                        {userMcps.length !== 1 ? "s" : ""} active
                      </p>
                    </div>
                    {isCurrentUser && (
                      <a
                        href={routes.mcps.new.href()}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium underline hover:bg-indigo-50 hover:text-indigo-900 transition-colors px-3 py-2"
                      >
                        + New MCP
                      </a>
                    )}
                  </div>
                  {userMcps.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                      <p className="text-gray-600 mb-4">
                        No MCPs yet. Create your first MCP!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userMcps.map((mcp) => (
                        <a
                          key={mcp.id}
                          href={routes.mcps.show.href({ id: mcp.id })}
                          className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {mcp.name}
                            </h3>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <pre className="whitespace-pre-wrap font-mono text-xs overflow-hidden">
                              {(() => {
                                try {
                                  const parsed = JSON.parse(mcp.context);
                                  const preview = JSON.stringify(
                                    parsed,
                                    null,
                                    2
                                  );
                                  return preview.length > 200
                                    ? preview.substring(0, 200) + "..."
                                    : preview;
                                } catch {
                                  return (
                                    mcp.context.substring(0, 200) +
                                    (mcp.context.length > 200 ? "..." : "")
                                  );
                                }
                              })()}
                            </pre>
                          </div>
                          <CreatedAt date={mcp.createdAt} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Layout>
        )
      };
}
