import { Asterisk, FileCode, Settings, User } from "lucide-react";
import { Layout } from "../../layouts/Layout";
import { Mcp } from "../../mcps/mcp";
import { Profile } from "../../profiles/profile";
import { routes } from "../../routes";
import { Rule } from "../../rules/rule";
import { Skill } from "../../skills/skill";
import { CreatedAt } from "../../utils/created-at";

type User = {
  githubUrl?: string | null;
  githubUsername?: string | null;
};

interface Props {
  userName: string;
  user: User | null;
  profiles: Profile[];
  userRules: Rule[];
  userMcps: Mcp[];
  userSkills?: Skill[];
  currentUser: any;
}

export function UserDashboard({
  userName,
  user,
  profiles,
  userRules,
  userMcps,
  userSkills = [],
  currentUser,
}: Props) {
  return (
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
                    slug: profile.slug,
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
                    slug: rule.slug,
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

        {/* Skills Section */}
        <div>
          <div className=" text-gray-900 flex items-center gap-3 mb-6">
            <Asterisk className="h-4 w-4 text-amber-500" /> Skills
          </div>
          {userSkills.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
              <p className="text-gray-600 mb-4">User has no skills</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userSkills.map((skill) => (
                <a
                  key={skill.id}
                  href={routes.users.skill.href({
                    user: userName,
                    slug: skill.slug,
                  })}
                  className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {skill.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {skill.description.length > 200
                      ? skill.description.substring(0, 200) + "..."
                      : skill.description}
                  </p>
                  <CreatedAt date={skill.createdAt} className="mt-4" />
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
                    slug: mcp.slug,
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
}
