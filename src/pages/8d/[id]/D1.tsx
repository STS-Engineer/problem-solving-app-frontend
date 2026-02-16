// src/pages/8d/[id]/D1.tsx
import { useStepData } from "../../../hooks/useStepData";
import { STEPS } from "../../../lib/steps";
import StepLayout from "../../StepLayout";
import { ValidationResult } from "../../../services/api/reports";

interface TeamMember {
  name: string;
  function: string;
  department: string;
  role: string;
}

interface D1FormData {
  team_members: TeamMember[];
}
interface D1Props {
  onRefreshSteps: () => void;
  onValidationUpdate: (validation: ValidationResult | null) => void; // 🆕
}
export default function D1({ onRefreshSteps, onValidationUpdate }: D1Props) {
  const meta = STEPS.find((s) => s.code === "D1")!;

  const {
    loading,
    saving,
    data,
    setData,
    validation,
    handleSaveDraft,
    handleSubmit,
  } = useStepData<D1FormData>("D1", {
    team_members: [
      { name: "", function: "", department: "", role: "" },
      { name: "", function: "", department: "", role: "" },
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
        { name: "", function: "", department: "", role: "" },
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
  const submit = async () => {
    await handleSubmit();
    onRefreshSteps();
    // 🆕 Update parent's validation state
    if (validation) {
      onValidationUpdate(validation);
    }
  };
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>⏳ Loading...</div>
    );
  }
  return (
    <>
      <StepLayout
        meta={meta}
        onSaveDraft={handleSaveDraft}
        onSubmit={submit}
        saving={saving}
      >
        {/* Team Members Section */}
        <div className="section">
          <h3>Team Members</h3>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="min-w-[180px]">Name *</th>
                  <th className="min-w-[160px]">Function *</th>
                  <th className="min-w-[140px]">Department *</th>
                  <th className="min-w-[140px]">Role *</th>
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
                      <input
                        value={member.function}
                        onChange={(e) =>
                          handleMemberChange(index, "function", e.target.value)
                        }
                        placeholder="Job title"
                      />
                    </td>
                    <td>
                      <input
                        value={member.department}
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            "department",
                            e.target.value,
                          )
                        }
                        placeholder="Department"
                      />
                    </td>
                    <td>
                      <select
                        className="w-full font-medium"
                        value={member.role}
                        onChange={(e) =>
                          handleMemberChange(index, "role", e.target.value)
                        }
                      >
                        <option value="">Select role...</option>
                        <option value="production">
                          Production (operator, line leader, supervisor)
                        </option>
                        <option value="maintenance">
                          Maintenance (if equipment involved)
                        </option>
                        <option value="engineering">
                          Process or Manufacturing Engineering
                        </option>
                        <option value="logistics">
                          Logistics / Supplier Quality
                        </option>
                        <option value="team_leader">
                          Team leader or project manager
                        </option>
                        <option value="other">Other</option>
                      </select>
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
    </>
  );
}
