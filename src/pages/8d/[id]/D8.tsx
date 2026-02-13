// src/pages/8d/[id]/D8.tsx
import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { useStepData } from "../../../hooks/useStepData";

interface ClosureSignature {
  closed_by: string;
  closure_date: string;
  approved_by: string;
  approval_date: string;
}

interface D8FormData {
  closure_statement: string;
  signatures: ClosureSignature;
}

export default function D8({ onRefreshSteps }: { onRefreshSteps: () => void }) {
  const meta = STEPS.find((s) => s.code === "D8")!;

  const { loading, saving, data, setData, handleSaveDraft, handleSubmit } =
    useStepData<D8FormData>("D8", {
      closure_statement: "",
      signatures: {
        closed_by: "",
        closure_date: "",
        approved_by: "",
        approval_date: "",
      },
    });

  const submit = async () => {
    await handleSubmit();
    onRefreshSteps();
  };

  const updateSignature = (field: keyof ClosureSignature, value: string) => {
    setData({
      ...data,
      signatures: {
        ...data.signatures,
        [field]: value,
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>⏳ Loading...</div>
    );
  }

  return (
    <StepLayout
      meta={meta}
      onSaveDraft={handleSaveDraft}
      onSubmit={submit}
      saving={saving}
    >
      {/* Section Header */}
      <div className="section">
        <h3>Closure & Capitalization</h3>
      </div>

      {/* Section Final Closure Statement */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          FINAL 8D CLOSURE STATEMENT
        </h4>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">
            Is the customer satisfied? Has the problem not recurred? Has the
            team learned and improved? Are all actions documented, visible and
            stabilized?
          </p>
        </div>

        <div className="field">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Closure Statement *
          </label>
          <textarea
            placeholder="Write comprehensive final closure statement addressing:
- Customer satisfaction
- Problem recurrence status
- Team learning and improvements
- Documentation and stabilization of actions"
            className="w-full font-medium bg-gray-50 border-gray-300"
            rows={10}
            value={data.closure_statement}
            onChange={(e) =>
              setData({ ...data, closure_statement: e.target.value })
            }
          />
        </div>

        {/* Character count helper */}
        <div className="mt-2 text-sm text-gray-600 flex justify-between">
          <span>
            {data.closure_statement.trim().length > 0 ? (
              <span className="text-green-600 font-semibold">
                ✓ {data.closure_statement.trim().length} characters
              </span>
            ) : (
              <span className="text-amber-600 font-semibold">
                ⚠️ Closure statement is required
              </span>
            )}
          </span>
          <span className="text-gray-500">
            Minimum recommended: 200 characters
          </span>
        </div>
      </div>

      {/* Section Signatures & Validation */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          Signatures & Validation
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="field">
            <label className="text-sm font-medium">Closed by *</label>
            <input
              type="text"
              placeholder="Name and title..."
              className="w-full font-medium"
              value={data.signatures.closed_by}
              onChange={(e) => updateSignature("closed_by", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="text-sm font-medium">Closure Date *</label>
            <input
              type="date"
              className="w-full font-medium"
              value={data.signatures.closure_date}
              onChange={(e) => updateSignature("closure_date", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="text-sm font-medium">
              Approved by (Quality Manager)
            </label>
            <input
              type="text"
              placeholder="Name and signature..."
              className="w-full font-medium"
              value={data.signatures.approved_by}
              onChange={(e) => updateSignature("approved_by", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="text-sm font-medium">Approval Date</label>
            <input
              type="date"
              className="w-full font-medium"
              value={data.signatures.approval_date}
              onChange={(e) => updateSignature("approval_date", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Success Message */}
      {data.closure_statement.trim().length >= 200 &&
        data.signatures.closed_by.trim() &&
        data.signatures.closure_date && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl border-2 border-green-300">
            <div className="flex items-start gap-4">
              <span className="text-5xl">🎉</span>
              <div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  8D Report Ready for Submission!
                </h2>
                <p className="text-green-800 font-medium">
                  All required fields are complete. The problem has been
                  resolved and documented. Click "Validate & Save" to finalize
                  the 8D report.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Action Buttons - Optional features */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          Additional Actions (Coming Soon)
        </h4>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="btn text-base px-6 py-3 opacity-50 cursor-not-allowed"
            disabled
          >
            <span className="text-xl">📄</span>
            <span>Generate PDF Report</span>
          </button>

          <button
            className="btn text-base px-6 py-3 opacity-50 cursor-not-allowed"
            disabled
          >
            <span className="text-xl">📧</span>
            <span>Send to Customer</span>
          </button>

          <button
            className="btn text-base px-6 py-3 opacity-50 cursor-not-allowed"
            disabled
          >
            <span className="text-xl">📊</span>
            <span>Export to Excel</span>
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-2 italic">
          * These features will be available in a future update
        </p>
      </div>
    </StepLayout>
  );
}
