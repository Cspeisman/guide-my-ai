import React from "react";
import { Layout } from "./layouts/Layout";
import { userIdKey } from "./auth/auth-middleware";
import { Mcp } from "./mcps/mcp";
import { McpsRepository } from "./mcps/mcps-repository";
import { Rule } from "./rules/rule";
import { RulesRepository } from "./rules/rules-repository";
import { Profile } from "./profiles/profile";
import { ProfilesRepository } from "./profiles/profiles-repository";
import { FileCode, Plus, Settings, Sparkles, User } from "lucide-react";
import { routes } from "./routes";
import { render } from "./utils";
import { CreatedAt } from "./utils/created-at";
import { UnauthedLayout } from "./layouts/UnauthedLayout";
export const homeHandler = (
  dependencies = {
    rulesRepository: new RulesRepository(),
    mcpsRepository: new McpsRepository(),
    profilesRepository: new ProfilesRepository(),
  }
) => {
  const { rulesRepository, mcpsRepository, profilesRepository } = dependencies;
  return {
    async home(context) {
      const userId = context.storage.get(userIdKey);

      let userRules: Rule[] = [];
      let userMcps: Mcp[] = [];
      let userProfiles: Profile[] = [];
      if (userId) {
        userRules = await rulesRepository.getRulesByUserId(userId);
        userMcps = await mcpsRepository.getMcpsByUserId(userId);
        userProfiles = await profilesRepository.getProfilesByUserId(userId);
      }

      return render(
        <>
          {!userId ? (
            <UnauthedLayout>
              <div className="mx-auto text-center py-16">
                <h1 className="text-3xl font-bold text-gray-900 font-mono mb-6">
                  Welcome to Guide My AI
                </h1>
                <p className="text-gray-600 mb-8">
                  Centralize your AI profiles, rules, and MCP servers. Pull them
                  into any project with ease.
                </p>
                <div className="flex justify-center gap-4">
                  <a
                    href={routes.auth.signup.index.href()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                  >
                    Sign Up
                  </a>
                  <a
                    href={routes.auth.login.index.href()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-8 py-3 rounded-lg transition-colors"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            </UnauthedLayout>
          ) : (
            <Layout activeNav="dashboard">
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
                    <a
                      href={routes.profiles.new.href()}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium underline hover:bg-indigo-50 hover:text-indigo-900 transition-colors px-3 py-2"
                    >
                      + New Profile
                    </a>
                  </div>
                  {userProfiles.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                      <p className="text-gray-600 mb-4">
                        No profiles yet. Create your first profile!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userProfiles.map((profile) => (
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
                    <a
                      href={routes.rules.new.href()}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium underline hover:bg-indigo-50 hover:text-indigo-900 transition-colors px-3 py-2"
                    >
                      + New Rule
                    </a>
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
                    <a
                      href={routes.mcps.new.href()}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium underline hover:bg-indigo-50 hover:text-indigo-900 transition-colors px-3 py-2"
                    >
                      + New MCP
                    </a>
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
          )}
        </>
      );
    },
  };
};
