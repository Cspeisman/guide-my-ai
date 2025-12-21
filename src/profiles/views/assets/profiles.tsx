import React, { Suspense, use, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "../../../routes";

const getProfiles = async () => {
  const response = await fetch(routes.profiles.api.index.href());
  if (!response.ok) {
    throw new Error("Failed to fetch profiles");
  }
  return response.json() as Promise<
    Array<{
      id: string;
      name: string;
      rules: Array<{ name: string; details: string }>;
    }>
  >;
};

export const ProfilesList = ({
  profilesPromise,
}: {
  profilesPromise: Promise<
    Array<{
      id: string;
      name: string;
      rules: Array<{ name: string; details: string }>;
    }>
  >;
}) => {
  const profiles = use(profilesPromise);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 font-mono mb-2">
          Profiles
        </h2>
        <p className="text-gray-600">Manage your AI configuration profiles</p>
      </div>
      {profiles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <p className="text-gray-600 mb-4">
            No profiles yet. Create your first profile to get started!
          </p>
          <button
            onClick={() => (window.location.href = routes.profiles.new.href())}
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Create Profile
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile, index) => (
            <a
              key={index}
              href={routes.profiles.show.href({ id: profile.id })}
              className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {profile.name}
              </h3>
              {profile.rules.length > 0 ? (
                <ul className="space-y-2">
                  {profile.rules.map((rule, ruleIndex) => (
                    <li
                      key={ruleIndex}
                      className="bg-gray-50 p-3 rounded-lg text-sm"
                    >
                      <span className="font-semibold text-gray-900">
                        {rule.name}:
                      </span>{" "}
                      <span className="text-gray-700">{rule.details}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No rules assigned</p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export const ProfilesView = () => {
  const profilesPromise = useMemo(() => getProfiles(), []);
  return (
    <Suspense fallback={<div>Loading profiles...</div>}>
      <ProfilesList profilesPromise={profilesPromise} />
    </Suspense>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<ProfilesView />);
}
