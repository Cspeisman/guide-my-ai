import React, { Suspense, use, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { McpAndRules } from "./mcp-and-rules";
import { routes } from "../../../routes";
import { Profile } from "../../profile";

interface Props {
  slug: string;
  getProfile(): Promise<ReturnType<Profile["toJson"]>>;
}

interface ProfileTitleProps {
  profile: Promise<ReturnType<Profile["toJson"]>>;
}

const ProfileForm = ({ profile }: ProfileTitleProps) => {
  const profilePayload = use(profile);
  const profileData = Profile.fromPayload(profilePayload);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(profileData.name);

  const handleSave = async () => {
    if (name === profileData.name) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        routes.profiles.api.edit.action.href({ slug: profileData.slug }),
        {
          method: "POST",
          body: JSON.stringify({
            name,
            ruleIds: profileData.rules?.map((r: any) => r.id) || [],
            mcpIds: profileData.mcps?.map((m: any) => m.id) || [],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 409) {
          alert(
            "A profile with this name already exists. Please choose a different name."
          );
        } else {
          alert(
            errorData.error ||
              "Failed to update profile name. Please try again."
          );
        }
        setName(profileData.name); // Revert on error
        setIsEditing(false);
        return;
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile name:", error);
      setName(profileData.name); // Revert on error
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(profileData.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <>
      <div className="mb-8">
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={isSaving}
            className="text-3xl font-bold text-gray-900 font-mono mb-2"
          />
        ) : (
          <h1
            className="text-3xl font-bold text-gray-900 font-mono mb-2"
            onClick={() => setIsEditing(true)}
          >
            {name}
          </h1>
        )}
      </div>
      <McpAndRules profile={profileData} />
    </>
  );
};

export const EditFormView = (props: Props) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileForm profile={props.getProfile()} />
      <div className="mt-8">
        <a
          href={routes.profiles.show.href({ slug: props.slug })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
        >
          ← Back to profile
        </a>
      </div>
    </Suspense>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const pathname = new URL(window.location.toString());
  const match = routes.profiles.edit.match(pathname);
  const slug = match?.params?.slug;
  const root = createRoot(rootElement);
  if (slug) {
    const getProfile = async () => {
      const response = await fetch(
        routes.profiles.api.edit.index.href({ slug })
      );
      if (response.status === 404) {
        window.location.href = routes.home.href();
        throw new Error("Profile not found");
      }
      return response.json();
    };
    root.render(<EditFormView slug={slug} getProfile={getProfile} />);
  }
}
