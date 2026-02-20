// src/pages/8d/[id]/D1.tsx
import { useStepData } from "../../../hooks/useStepData";
import { STEPS } from "../../../lib/steps";
import StepLayout from "../../StepLayout";
import { ValidationResult } from "../../../services/api/reports";
import ValidationSpinner from "../../../components/ValidationSpinner";

interface TeamMember {
  name: string;
  function: string;
  department: string;
}

interface D1FormData {
  team_members: TeamMember[];
}

interface D1Props {
  onRefreshSteps: () => void;
  onValidationUpdate: (validation: ValidationResult | null) => void;
}

export default function D1({ onRefreshSteps, onValidationUpdate }: D1Props) {
  const meta = STEPS.find((s) => s.code === "D1")!;

  const {
    loading,
    saving,
    validating, // NEW: AI spinner state
    data,
    setData,
    handleSaveDraft,
    handleSubmit,
  } = useStepData<D1FormData>("D1", {
    team_members: [
      { name: "", function: "", department: "" },
      { name: "", function: "", department: "" },
    ],
  });

  const handleMemberChange = (
    index: number,
    field: keyof TeamMember,
    value: string,
  ) => {
    const updated = [...data.team_members];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, team_members: updated });
  };

  const addMember = () => {
    setData({
      ...data,
      team_members: [
        ...data.team_members,
        { name: "", function: "", department: "" },
      ],
    });
  };

  const removeMember = (index: number) => {
    const updated = data.team_members.filter((_, i) => i !== index);
    setData({ ...data, team_members: updated });
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>⏳ Loading...</div>
    );
  }

  // BUG FIX #2: use the RETURN VALUE of handleSubmit (fresh validation),
  // not the stale `validation` state variable.
  const submit = async () => {
    const freshValidation = await handleSubmit();
    onRefreshSteps();
    // Now we pass the freshly-returned value — no stale-state issue
    onValidationUpdate(freshValidation);
  };

  // Show the AI validation spinner overlay while waiting for OpenAI
  if (validating) {
    return <ValidationSpinner stepCode="D1" />;
  }

  return (
    <StepLayout
      meta={meta}
      onSaveDraft={handleSaveDraft}
      onSubmit={submit}
      saving={saving || validating}
    >
      {/* Team Members Section */}
      <div className="section">
        <h3>Team Members</h3>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="min-w-[180px]">Name *</th>
                <th className="min-w-[160px]">Department *</th>
                <th className="min-w-[140px]">Function *</th>
                <th className="min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.team_members.map((member, index) => (
                <tr key={index}>
                  <td>
                    <input
                      className="font-medium"
                      value={member.name}
                      onChange={(e) =>
                        handleMemberChange(index, "name", e.target.value)
                      }
                      placeholder="Full name"
                    />
                  </td>
                  <td>
                    <select
                      className="w-full font-medium"
                      value={
                        member.department === "" ||
                        [
                          "production",
                          "maintenance",
                          "engineering",
                          "quality",
                          "logistics",
                          "supplier_quality",
                          "other",
                        ].includes(member.department)
                          ? member.department
                          : "other"
                      }
                      onChange={(e) => {
                        if (e.target.value === "other") {
                          handleMemberChange(index, "department", "other");
                        } else {
                          handleMemberChange(
                            index,
                            "department",
                            e.target.value,
                          );
                        }
                      }}
                    >
                      <option value="">Select Department...</option>
                      <option value="production">Production</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="engineering">Engineering</option>
                      <option value="quality">Quality</option>
                      <option value="logistics">Logistics</option>
                      <option value="supplier_quality">Supplier Quality</option>
                      <option value="other">Other</option>
                    </select>
                    {(member.department === "other" ||
                      (member.department !== "" &&
                        ![
                          "production",
                          "maintenance",
                          "engineering",
                          "quality",
                          "logistics",
                          "supplier_quality",
                          "other",
                        ].includes(member.department))) && (
                      <input
                        className="w-full font-medium mt-1"
                        placeholder="Please specify..."
                        value={
                          [
                            "production",
                            "maintenance",
                            "engineering",
                            "quality",
                            "logistics",
                            "supplier_quality",
                            "other",
                          ].includes(member.department)
                            ? ""
                            : member.department
                        }
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            "department",
                            e.target.value,
                          )
                        }
                      />
                    )}
                  </td>
                  <td>
                    <select
                      className="w-full font-medium"
                      value={
                        member.function === "" ||
                        [
                          "operator",
                          "line_leader",
                          "supervisor",
                          "technician",
                          "engineer",
                          "team_leader",
                          "project_manager",
                          "other",
                        ].includes(member.function)
                          ? member.function
                          : "other"
                      }
                      onChange={(e) => {
                        if (e.target.value === "other") {
                          handleMemberChange(index, "function", "other");
                        } else {
                          handleMemberChange(index, "function", e.target.value);
                        }
                      }}
                    >
                      <option value="">Select Function...</option>
                      <option value="operator">Operator</option>
                      <option value="line_leader">Line Leader</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="engineer">Engineer</option>
                      <option value="team_leader">Team Leader</option>
                      <option value="project_manager">Project Manager</option>
                      <option value="other">Other</option>
                    </select>
                    {(member.function === "other" ||
                      (member.function !== "" &&
                        ![
                          "operator",
                          "line_leader",
                          "supervisor",
                          "technician",
                          "engineer",
                          "team_leader",
                          "project_manager",
                          "other",
                        ].includes(member.function))) && (
                      <input
                        className="w-full font-medium mt-1"
                        placeholder="Please specify..."
                        value={
                          [
                            "operator",
                            "line_leader",
                            "supervisor",
                            "technician",
                            "engineer",
                            "manager",
                            "team_leader",
                            "project_manager",
                            "other",
                          ].includes(member.function)
                            ? ""
                            : member.function
                        }
                        onChange={(e) =>
                          handleMemberChange(index, "function", e.target.value)
                        }
                      />
                    )}
                  </td>
                  <td>
                    {data.team_members.length > 1 && (
                      <button
                        onClick={() => removeMember(index)}
                        style={{
                          background: "#E74C3C",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 12px",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={addMember}
            className="btn flex items-center gap-4 hover:scale-105 transition-transform"
          >
            <span className="text-lg">➕</span>
            <span>Add Member</span>
          </button>

          <div className="text-sm text-gray-500 font-medium">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
              <span className="text-blue-600">ℹ️</span>
              <span>
                {data.team_members.filter((m) => m.name).length} members
              </span>
            </span>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
