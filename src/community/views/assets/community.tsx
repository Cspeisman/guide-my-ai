import { createRoot } from "react-dom/client";
import { useState, Suspense, use, useMemo } from "react";
import {
  User,
  FileCode,
  Settings,
  Copy,
  Check,
  Info,
  Download,
} from "lucide-react";
import { routes } from "../../../routes";
import { Profile } from "../../../profiles/profile";
import { Rule } from "../../../rules/rule";
import { Mcp } from "../../../mcps/mcp";

type Tab = "profiles" | "rules" | "mcps";

async function fetchProfiles(): Promise<Profile[]> {
  const res = await fetch("/api/community?type=profiles");
  if (!res.ok) throw new Error("Failed to fetch profiles");
  const data = await res.json();
  return data.map((d: any) => Profile.fromPayload(d));
}

async function fetchRules(): Promise<Rule[]> {
  const res = await fetch("/api/community?type=rules");
  if (!res.ok) throw new Error("Failed to fetch rules");
  const data = await res.json();
  return data.map((d: any) => Rule.fromPayload(d));
}

async function fetchMcps(): Promise<Mcp[]> {
  const res = await fetch("/api/community?type=mcps");
  if (!res.ok) throw new Error("Failed to fetch mcps");
  const data = await res.json();
  return data.map((d: any) => Mcp.fromPayload(d));
}

function ProfileCard({ profile }: { profile: Profile }) {
  const [copied, setCopied] = useState(false);
  const profileEndpoint = `${profile.userName}/profiles/${profile.slug}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await navigator.clipboard.writeText(profileEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <a
      href={routes.users.profile.href({
        user: profile.userName ?? "",
        slug: profile.slug,
      })}
      className="block bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all"
    >
      {/* Header with title and stats */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {profile.name}
          </h2>
          <p className="text-base text-gray-500">by {profile.userName}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Download className="h-4 w-4" />
          <span className="text-sm">{profile.communityDownloads}</span>
        </div>
      </div>

      {/* Endpoint section with info icon */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 px-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="group/info relative shrink-0">
            <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/info:block w-64 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
              Copy profile endpoint to paste into your pull community profile
              command
              <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <code className="flex-1 text-sm text-gray-700 font-mono">
            {profileEndpoint}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            title="Copy endpoint"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Rules and MCPs lists */}
      {(profile.rules.length > 0 || profile.mcps.length > 0) && (
        <div className="space-y-4 mb-6">
          {profile.rules.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileCode className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Rules ({profile.rules.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.rules.map((rule) => (
                  <a
                    key={rule.id}
                    href={routes.users.rule.href({
                      user: profile.userName ?? "",
                      slug: rule.slug,
                    })}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                  >
                    {rule.name}
                  </a>
                ))}
              </div>
            </div>
          )}
          {profile.mcps.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  MCPs ({profile.mcps.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.mcps.map((mcp) => (
                  <a
                    key={mcp.id}
                    href={routes.users.mcp.href({
                      user: profile.userName ?? "",
                      slug: mcp.slug,
                    })}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-colors"
                  >
                    {mcp.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer with date and copy path link */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-500">
          Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </a>
  );
}

function ProfilesList(props: { fetchProfiles: Promise<Profile[]> }) {
  const profiles = use(props.fetchProfiles);

  // Sort profiles by download count (highest first)
  const sortedProfiles = [...profiles].sort(
    (a, b) => (b.communityDownloads ?? 0) - (a.communityDownloads ?? 0)
  );

  if (sortedProfiles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
        <User className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Community Profiles Yet
        </h3>
        <p className="text-gray-600">
          Be the first to share a profile with the community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedProfiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}

function RuleCard({ rule }: { rule: Rule }) {
  const [copied, setCopied] = useState(false);
  const ruleEndpoint = `${rule.userName}/rules/${rule.slug}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await navigator.clipboard.writeText(ruleEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <a
      href={routes.users.rule.href({
        user: rule.userName ?? "",
        slug: rule.slug,
      })}
      className="block bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all"
    >
      {/* Header with title and stats */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{rule.name}</h2>
          <p className="text-base text-gray-500">by {rule.userName}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Download className="h-4 w-4" />
          <span className="text-sm">{rule.communityDownloads}</span>
        </div>
      </div>

      {/* Endpoint section with info icon */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 px-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="group/info relative shrink-0">
            <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/info:block w-64 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
              Copy rule endpoint to paste into your pull community rule command
              <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <code className="flex-1 text-sm text-gray-700 font-mono">
            {ruleEndpoint}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            title="Copy endpoint"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Content preview */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-700 line-clamp-3 font-mono">
          {rule.content}
        </p>
      </div>

      {/* Footer with date */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-500">
          Created: {new Date(rule.createdAt).toLocaleDateString()}
        </span>
      </div>
    </a>
  );
}

function RulesList(props: { fetchRules: Promise<Rule[]> }) {
  const rules = use(props.fetchRules);

  // Sort rules by download count (highest first)
  const sortedRules = [...rules].sort(
    (a, b) => (b.communityDownloads ?? 0) - (a.communityDownloads ?? 0)
  );

  if (sortedRules.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
        <FileCode className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Community Rules Yet
        </h3>
        <p className="text-gray-600">
          Be the first to share a rule with the community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedRules.map((rule) => (
        <RuleCard key={rule.id} rule={rule} />
      ))}
    </div>
  );
}

function McpCard({ mcp }: { mcp: Mcp }) {
  const [copied, setCopied] = useState(false);
  const mcpEndpoint = `${mcp.userName}/mcps/${mcp.slug}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await navigator.clipboard.writeText(mcpEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <a
      href={routes.users.mcp.href({
        user: mcp.userName ?? "",
        slug: mcp.slug,
      })}
      className="block bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all"
    >
      {/* Header with title and stats */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{mcp.name}</h2>
          <p className="text-base text-gray-500">by {mcp.userName}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Download className="h-4 w-4" />
          <span className="text-sm">{mcp.communityDownloads}</span>
        </div>
      </div>

      {/* Endpoint section with info icon */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 px-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="group/info relative shrink-0">
            <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/info:block w-64 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
              Copy MCP endpoint to paste into your pull community MCP command
              <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <code className="flex-1 text-sm text-gray-700 font-mono">
            {mcpEndpoint}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            title="Copy endpoint"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Footer with date */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-500">
          Created: {new Date(mcp.createdAt).toLocaleDateString()}
        </span>
      </div>
    </a>
  );
}

function McpsList(props: { fetchMcps: Promise<Mcp[]> }) {
  const mcps = use(props.fetchMcps);

  // Sort mcps by download count (highest first)
  const sortedMcps = [...mcps].sort(
    (a, b) => (b.communityDownloads ?? 0) - (a.communityDownloads ?? 0)
  );

  if (sortedMcps.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
        <Settings className="h-12 w-12 text-purple-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Community MCPs Yet
        </h3>
        <p className="text-gray-600">
          Be the first to share an MCP with the community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedMcps.map((mcp) => (
        <McpCard key={mcp.id} mcp={mcp} />
      ))}
    </div>
  );
}

function LoadingSpinner({ type }: { type: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent mb-4"></div>
      <p className="text-gray-600">Loading {type}...</p>
    </div>
  );
}

export const CommunityView = () => {
  const [activeTab, setActiveTab] = useState<Tab>("profiles");
  const fetchProfilesPromise = useMemo(() => fetchProfiles(), []);
  const fetchRulesPromise = useMemo(() => fetchRules(), []);
  const fetchMcpsPromise = useMemo(() => fetchMcps(), []);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("profiles")}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "profiles"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <User className="h-4 w-4" />
            Profiles
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "rules"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileCode className="h-4 w-4" />
            Rules
          </button>
          <button
            onClick={() => setActiveTab("mcps")}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "mcps"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Settings className="h-4 w-4" />
            MCPs
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "profiles" && (
          <Suspense fallback={<LoadingSpinner type="profiles" />}>
            <ProfilesList fetchProfiles={fetchProfilesPromise} />
          </Suspense>
        )}

        {activeTab === "rules" && (
          <Suspense fallback={<LoadingSpinner type="rules" />}>
            <RulesList fetchRules={fetchRulesPromise} />
          </Suspense>
        )}

        {activeTab === "mcps" && (
          <Suspense fallback={<LoadingSpinner type="mcps" />}>
            <McpsList fetchMcps={fetchMcpsPromise} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<CommunityView />);
}
