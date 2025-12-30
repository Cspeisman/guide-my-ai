import { Controller, RequestContext } from "@remix-run/fetch-router";
import { FileCode, Settings, User } from "lucide-react";
import { Layout } from "../layouts/Layout";
import { routes } from "../routes";
import { render } from "../utils";
import { CreatedAt } from "../utils/created-at";
import { UsersRepository } from "./users-repository";
import { ProfilesRepository } from "../profiles/profiles-repository";
import { RulesRepository } from "../rules/rules-repository";
import { McpsRepository } from "../mcps/mcps-repository";
import { UserProfile } from "./views/user-profile";
import { userNameKey } from "../auth/auth-middleware";
import { UserResource } from "./views/user-rule";

export const usersHandler = (
  dependencies = {
    usersRepository: new UsersRepository(),
    profilesRepository: new ProfilesRepository(),
    rulesRepository: new RulesRepository(),
    mcpsRepository: new McpsRepository(),
  }
) => {
  const {
    usersRepository,
    profilesRepository,
    rulesRepository,
    mcpsRepository,
  } = dependencies;

  const NotFoundComponent = (props: { id: string; type: string }) => (
    <Layout>
      <pre>
        Sorry we were unable to find {props.type} with ID: {props.id}
      </pre>
    </Layout>
  );

  return {
    async index(context: RequestContext) {
      const matches = routes.users.index.match(context.request.url);
      const userName = matches?.params.user;

      if (!userName) {
        return Response.json(
          { error: "Username is required" },
          { status: 400 }
        );
      }
      const result = await usersRepository.getProfilesByUsername(userName);
      const { profiles } = result ?? { userId: null, profiles: [] };

      // Collect all rules from all profiles into a single usersRules array
      const userRules = profiles.flatMap((profile) => profile.rules);
      // Collect all mcps from all profiles into a single userMcps array
      const userMcps = profiles.flatMap((profile) => profile.mcps);
      const currentUserName = context.storage.get(userNameKey);
      return render(
        <Layout activeNav="dashboard" userName={currentUserName ?? "unknown"}>
          <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-mono">
                  {userName}'s Dashboard
                </h1>
              </div>
            </div>

            {/* Profiles Section */}
            <div>
              <div className=" text-gray-900 flex items-center gap-3 mb-6">
                <User className="h-4 w-4 text-green-500" /> Profiles
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
                      href={routes.users.profile.href({
                        user: userName,
                        id: profile.id,
                      })}
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
                      <CreatedAt date={profile.createdAt} className="mt-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Rules Section */}
            <div>
              <div className=" text-gray-900 flex items-center gap-3 mb-6">
                <FileCode className="h-4 w-4 text-blue-500" /> Rules
              </div>
              {userRules.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                  <p className="text-gray-600 mb-4">User has no rules</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userRules.map((rule) => (
                    <a
                      key={rule.id}
                      href={routes.users.rule.href({
                        user: userName,
                        id: rule.id,
                      })}
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
              <div className=" text-gray-900 flex items-center gap-3 mb-6">
                <Settings className="h-4 w-4 text-purple-500" /> MCPs
              </div>
              {userMcps.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                  <p className="text-gray-600 mb-4">User has no MCPs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userMcps.map((mcp) => (
                    <a
                      key={mcp.id}
                      href={routes.users.mcp.href({
                        user: userName,
                        id: mcp.id,
                      })}
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
                              const preview = JSON.stringify(parsed, null, 2);
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
      );
    },
    async profile(context) {
      const matches = routes.users.profile.match(context.request.url);
      const userName = matches?.params.user;
      const profileId = matches?.params.id;
      if (userName && profileId) {
        const user = await usersRepository.getUserByUsername(userName);
        if (user) {
          const profile = await profilesRepository.getProfileByIdAndUserId(
            profileId,
            user.id
          );
          if (profile) {
            const currentUserName = context.storage.get(userNameKey);
            return render(
              <UserProfile
                profile={profile}
                currentUserName={currentUserName ?? "unknown"}
                userName={userName}
              />
            );
          }
        }
      }
      return render(<NotFoundComponent id={profileId ?? ""} type="profile" />);
    },
    async rule(context) {
      const matches = routes.users.rule.match(context.request.url);
      const userName = matches?.params.user;
      const ruleId = matches?.params.id;
      if (userName && ruleId) {
        const user = await usersRepository.getUserByUsername(userName);
        if (user) {
          const rule = await rulesRepository.getRuleByIdAndUserId(
            ruleId,
            user.id
          );
          if (rule) {
            const currentUserName = context.storage.get(userNameKey);
            return render(
              <UserResource
                name={rule.name}
                content={rule.content}
                createdAt={rule.createdAt}
                currentUserName={currentUserName ?? "unknown"}
                userName={userName}
              />
            );
          }
        }
      }
      return render(<NotFoundComponent id={ruleId ?? ""} type="rule" />);
    },
    async mcp(context) {
      const matches = routes.users.mcp.match(context.request.url);
      const userName = matches?.params.user;
      const mcpId = matches?.params.id;
      if (userName && mcpId) {
        const user = await usersRepository.getUserByUsername(userName);
        if (user) {
          const mcp = await mcpsRepository.getMcpByIdAndUserId(mcpId, user.id);
          if (mcp) {
            const currentUserName = context.storage.get(userNameKey);
            return render(
              <UserResource
                name={mcp.name}
                content={mcp.context}
                createdAt={mcp.createdAt}
                currentUserName={currentUserName ?? "unknown"}
                userName={userName}
              />
            );
          }
        }
      }
      return render(<NotFoundComponent id={mcpId ?? ""} type="mcp" />);
    },
  } satisfies Controller<typeof routes.users>;
};
