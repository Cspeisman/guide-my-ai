import { useState } from "react";
import { routes } from "../../../routes";
import { Profile } from "../../profile";
import { MultiSelectSection } from "./multi-select-section";
import { Mcp } from "../../../mcps/mcp";
import { Rule } from "../../../rules/rule";
import { Skill } from "../../../skills/skill";

export const McpAndRules = ({ profile: profileData }: { profile: Profile }) => {
  const [assignedMcps, setAssignedMcps] = useState<Mcp[]>(profileData.mcps);
  const [assignedRules, setAssignedRules] = useState<Rule[]>(profileData.rules);
  const [assignedSkills, setAssignedSkills] = useState<Skill[]>(
    profileData.skills
  );
  const [isSaving, setIsSaving] = useState(false);

  // Save associations to the server
  const saveAssociations = async (
    mcps: Mcp[],
    rules: Rule[],
    skills: Skill[]
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch(
        routes.profiles.api.edit.action.href({ slug: profileData.slug }),
        {
          method: "POST",
          body: JSON.stringify({
            mcpIds: mcps.map((m) => m.id),
            ruleIds: rules.map((r) => r.id),
            skillIds: skills.map((s) => s.id),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to save associations:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle MCP changes
  const handleMcpsChange = (mcps: Mcp[]) => {
    setAssignedMcps(mcps);
    saveAssociations(mcps, assignedRules, assignedSkills);
  };

  // Handle Rule changes
  const handleRulesChange = (rules: Rule[]) => {
    setAssignedRules(rules);
    saveAssociations(assignedMcps, rules, assignedSkills);
  };

  // Handle Skill changes
  const handleSkillsChange = (skills: Skill[]) => {
    setAssignedSkills(skills);
    saveAssociations(assignedMcps, assignedRules, skills);
  };

  if (!profileData.slug) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <MultiSelectSection
        title="MCPs"
        items={assignedMcps}
        fetchEndpoint={routes.mcps.api.index.href()}
        onItemsChange={handleMcpsChange}
        isSaving={isSaving}
        placeholder="Search and add MCPs..."
      />

      <MultiSelectSection
        title="Rules"
        items={assignedRules}
        fetchEndpoint={routes.rules.api.index.href()}
        onItemsChange={handleRulesChange}
        isSaving={isSaving}
        placeholder="Search and add Rules..."
      />

      <MultiSelectSection
        title="Skills"
        items={assignedSkills}
        fetchEndpoint={routes.skills.api.index.href()}
        onItemsChange={handleSkillsChange}
        isSaving={isSaving}
        placeholder="Search and add Skills..."
      />
    </div>
  );
};
