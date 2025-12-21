import React, { Suspense, use, useState } from "react";
import { createRoot } from "react-dom/client";
import { McpAndRules } from "./mcp-and-rules";
import { routes } from "../../../routes";

interface Props {
  profileId: string;
}

interface ProfileTitleProps {
  profile: Promise<any>;
}

const ProfileTitle = ({ profile }: ProfileTitleProps) => {
  const profileData = use(profile);
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
        routes.profiles.api.edit.action.href({ id: profileData.id }),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
  );
};

const EditFormView = (props: Props) => {
  const profile = async () => {
    const response = await fetch(
      routes.profiles.api.edit.index.href({ id: props.profileId })
    );
    return response.json();
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileTitle profile={profile()} />
      <McpAndRules profileId={props.profileId} />
      <div className="mt-8">
        <a
          href={routes.profiles.show.href({ id: props.profileId })}
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
  const profileId = match?.params?.id;
  const root = createRoot(rootElement);
  if (profileId) {
    root.render(<EditFormView profileId={profileId} />);
  }
}
