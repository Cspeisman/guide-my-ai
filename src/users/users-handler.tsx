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
import { getUserContext } from "../auth/user-context";
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

      // Get the user to access GitHub profile info
      const user = await usersRepository.getUserByUsername(userName);

      // Collect all rules from all profiles into a single usersRules array
      const userRules = profiles.flatMap((profile) => profile.rules);
      // Collect all mcps from all profiles into a single userMcps array
      const userMcps = profiles.flatMap((profile) => profile.mcps);
      const currentUser = getUserContext(context);
      return render(
        <Layout activeNav="dashboard" user={currentUser}>
          <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-mono">
                  {userName}'s Dashboard
                </h1>
                {user?.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    @{user.githubUsername}
                  </a>
                )}
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
            const currentUser = getUserContext(context);
            return render(
              <UserProfile
                profile={profile}
                currentUserName={currentUser.userName ?? "unknown"}
                userName={userName}
                currentUserGithubUrl={currentUser.githubUrl}
                currentUserGithubUsername={currentUser.githubUsername}
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
            const currentUser = getUserContext(context);
            return render(
              <UserResource
                name={rule.name}
                content={rule.content}
                createdAt={rule.createdAt}
                currentUserName={currentUser.userName ?? "unknown"}
                userName={userName}
                currentUserGithubUrl={currentUser.githubUrl}
                currentUserGithubUsername={currentUser.githubUsername}
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
            const currentUser = getUserContext(context);
            return render(
              <UserResource
                name={mcp.name}
                content={mcp.context}
                createdAt={mcp.createdAt}
                currentUserName={currentUser.userName ?? "unknown"}
                userName={userName}
                currentUserGithubUrl={currentUser.githubUrl}
                currentUserGithubUsername={currentUser.githubUsername}
              />
            );
          }
        }
      }
      return render(<NotFoundComponent id={mcpId ?? ""} type="mcp" />);
    },
    api: {
      async show(context) {
        const matches = routes.users.api.show.match(context.request.url);
        const userName = matches?.params.user;

        if (!userName) {
          return Response.json(
            { error: "Username is required" },
            { status: 400 }
          );
        }

        // Get user information
        const user = await usersRepository.getUserByUsername(userName);

        if (!user) {
          return Response.json(
            { error: `User '${userName}' not found` },
            { status: 404 }
          );
        }

        // Get all profiles with their rules and mcps
        const result = await usersRepository.getProfilesByUsername(userName);
        const { profiles } = result ?? { profiles: [] };

        return Response.json({
          profiles: profiles.map((profile) => ({
            id: profile.id,
            name: profile.name,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
            rulesCount: profile.rules.length,
            mcpsCount: profile.mcps.length,
          })),
        });
      },
    },
  } satisfies Controller<typeof routes.users>;
};
