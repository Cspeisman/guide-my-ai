import React, { useState, useEffect } from "react";
import Select, { MultiValue } from "react-select";
import { X } from "lucide-react";
import { routes } from "../../../routes";

interface Mcp {
  id: string;
  name: string;
}

interface Rule {
  id: string;
  name: string;
}

interface McpAndRulesProps {
  profileId?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export const McpAndRules: React.FC<McpAndRulesProps> = ({ profileId }) => {
  const [allMcps, setAllMcps] = useState<Mcp[]>([]);
  const [allRules, setAllRules] = useState<Rule[]>([]);
  const [assignedMcps, setAssignedMcps] = useState<Mcp[]>([]);
  const [assignedRules, setAssignedRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load all MCPs, Rules, and profile data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch all MCPs and Rules
        const [mcpsResponse, rulesResponse] = await Promise.all([
          fetch(routes.mcps.api.index.href()),
          fetch(routes.rules.api.index.href()),
        ]);

        if (mcpsResponse.ok && rulesResponse.ok) {
          const mcpsData = await mcpsResponse.json();
          const rulesData = await rulesResponse.json();
          setAllMcps(mcpsData);
          setAllRules(rulesData);
        }

        // If we have a profile ID, load its assigned MCPs and Rules
        if (profileId) {
          const profileResponse = await fetch(
            routes.profiles.api.edit.index.href({ id: profileId })
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setAssignedMcps(profileData.mcps || []);
            setAssignedRules(profileData.rules || []);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [profileId]);

  // Save associations to the server
  const saveAssociations = async (mcps: Mcp[], rules: Rule[]) => {
    if (!profileId) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        routes.profiles.api.edit.action.href({ id: profileId }),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mcpIds: mcps.map((m) => m.id),
            ruleIds: rules.map((r) => r.id),
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

  // Handle MCP selection change
  const handleMcpChange = (selectedOptions: MultiValue<SelectOption>) => {
    const selectedMcps = allMcps.filter((mcp) =>
      selectedOptions.some((option) => option.value === String(mcp.id))
    );

    setAssignedMcps(selectedMcps);
    saveAssociations(selectedMcps, assignedRules);
  };

  // Handle Rule selection change
  const handleRuleChange = (selectedOptions: MultiValue<SelectOption>) => {
    const selectedRules = allRules.filter((rule) =>
      selectedOptions.some((option) => option.value === String(rule.id))
    );

    setAssignedRules(selectedRules);
    saveAssociations(assignedMcps, selectedRules);
  };

  // Handle removing an MCP
  const handleRemoveMcp = (mcpId: string) => {
    const updatedMcps = assignedMcps.filter((mcp) => mcp.id !== mcpId);
    setAssignedMcps(updatedMcps);
    saveAssociations(updatedMcps, assignedRules);
  };

  // Handle removing a Rule
  const handleRemoveRule = (ruleId: string) => {
    const updatedRules = assignedRules.filter((rule) => rule.id !== ruleId);
    setAssignedRules(updatedRules);
    saveAssociations(assignedMcps, updatedRules);
  };

  // Get selected MCP values
  const selectedMcpValues: SelectOption[] = assignedMcps.map((mcp) => ({
    value: String(mcp.id),
    label: mcp.name,
  }));

  // Get selected Rule values
  const selectedRuleValues: SelectOption[] = assignedRules.map((rule) => ({
    value: String(rule.id),
    label: rule.name,
  }));

  if (!profileId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading MCPs and Rules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {/* MCPs Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">MCPs</h3>

        {/* MCP Multi-Select */}
        <div className="mb-4">
          <Select
            isMulti
            options={allMcps.map((mcp) => ({
              value: String(mcp.id),
              label: mcp.name,
            }))}
            value={selectedMcpValues}
            onChange={handleMcpChange}
            placeholder="Search and add MCPs..."
            isDisabled={isSaving}
            controlShouldRenderValue={false}
            isClearable={false}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                padding: "4px",
                borderRadius: "0.5rem",
                borderColor: "#d1d5db",
                "&:hover": {
                  borderColor: "#9ca3af",
                },
              }),
            }}
          />
        </div>

        {/* Selected MCPs List */}
        {assignedMcps.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Selected MCPs ({assignedMcps.length})
            </h4>
            <ul className="space-y-2">
              {assignedMcps.map((mcp) => (
                <li
                  key={mcp.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {mcp.name}
                  </span>
                  <button
                    onClick={() => handleRemoveMcp(mcp.id)}
                    disabled={isSaving}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-1 transition-colors disabled:opacity-50"
                    aria-label={`Remove ${mcp.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Rules Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rules</h3>

        {/* Rule Multi-Select */}
        <div className="mb-4">
          <Select
            isMulti
            options={allRules.map((rule) => ({
              value: String(rule.id),
              label: rule.name,
            }))}
            isClearable={false}
            value={selectedRuleValues}
            onChange={handleRuleChange}
            placeholder="Search and add Rules..."
            isDisabled={isSaving}
            controlShouldRenderValue={false}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                padding: "4px",
                borderRadius: "0.5rem",
                borderColor: "#d1d5db",
                "&:hover": {
                  borderColor: "#9ca3af",
                },
              }),
            }}
          />
        </div>

        {/* Selected Rules List */}
        {assignedRules.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Selected Rules ({assignedRules.length})
            </h4>
            <ul className="space-y-2">
              {assignedRules.map((rule) => (
                <li
                  key={rule.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {rule.name}
                  </span>
                  <button
                    onClick={() => handleRemoveRule(rule.id)}
                    disabled={isSaving}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-1 transition-colors disabled:opacity-50"
                    aria-label={`Remove ${rule.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
