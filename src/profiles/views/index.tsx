import React from "react";
import { Layout } from "../../layouts/Layout";
import { routes } from "../../routes";
import { User } from "lucide-react";
import { Profile } from "../profile";
import { CreatedAt } from "../../utils/created-at";
export { New } from "./new";
export { Show } from "./show";
interface Props {
  userProfiles: Profile[];
}
export const Index = (props: Props) => {
  return (
    <Layout activeNav="profiles">
      {/* Profiles Section */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <div className="text-gray-900 flex items-center gap-3">
            <User className="h-6 w-6 text-green-500" />
            <h2 className="text-3xl font-bold font-mono">Profiles</h2>
          </div>
          <a
            href={routes.profiles.new.href()}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium underline hover:bg-indigo-50 hover:text-indigo-900 transition-colors px-3 py-2"
          >
            + New Profile
          </a>
        </div>
        {props.userProfiles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <p className="text-gray-600 mb-4">
              No profiles yet. Create your first profile!
            </p>
            <a
              href={routes.profiles.new.href()}
              className="px-6 py-2.5 rounded-lg bg-indigo-50 text-indigo-900 hover:bg-indigo-100 transition-all shadow-sm hover:shadow-md"
            >
              Create Profile
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {props.userProfiles.map((profile) => (
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
                <CreatedAt date={profile.createdAt} className="mt-4" />
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
