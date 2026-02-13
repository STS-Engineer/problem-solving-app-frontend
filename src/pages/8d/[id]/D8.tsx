import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { useStepData } from "../../../hooks/useStepData";

interface D8FormData {}
export default function D8({ onRefreshSteps }: { onRefreshSteps: () => void }) {
  const meta = STEPS.find((s) => s.code === "D8")!;
  const submit = async () => {
    await handleSubmit();
    onRefreshSteps();
  };
  const { loading, saving, data, setData, handleSaveDraft, handleSubmit } =
    useStepData<D8FormData>("D8", {});

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
            Closure Statement
          </label>
          <textarea
            placeholder="Write comprehensive final closure statement addressing:
- Customer satisfaction
- Problem recurrence status
- Team learning and improvements
- Documentation and stabilization of actions"
            className="w-full font-medium bg-gray-50 border-gray-300"
            rows={10}
          />
        </div>
      </div>

      {/* Section Signatures & Validation */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          Signatures & Validation
        </h4>

        <div className="appGrid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="field">
            <label className="text-sm font-medium">Closed by</label>
            <input
              type="text"
              placeholder="Name and title..."
              className="w-full font-medium"
            />
          </div>

          <div className="field">
            <label className="text-sm font-medium">Closure Date</label>
            <input type="date" className="w-full font-medium" />
          </div>

          <div className="field">
            <label className="text-sm font-medium">
              Approved by (Quality Manager)
            </label>
            <input
              type="text"
              placeholder="Name and signature..."
              className="w-full font-medium"
            />
          </div>

          <div className="field">
            <label className="text-sm font-medium">Approval Date</label>
            <input type="date" className="w-full font-medium" />
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="mt-6 p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl border-2 border-green-300">
        <div className="flex items-start gap-4">
          <span className="text-5xl">🎉</span>
          <div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              8D Report Completed!
            </h2>
            <p className="text-green-800 font-medium">
              All steps have been completed. The problem has been resolved and
              documented. Continuous improvement is key to operational
              excellence.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button className="btn primary text-base sm:text-lg px-6 py-3">
          <span className="text-xl">💾</span>
          <span>Save & Close</span>
        </button>

        <button className="btn text-base sm:text-lg px-6 py-3">
          <span className="text-xl">📄</span>
          <span>Generate PDF Report</span>
        </button>

        <button className="btn text-base sm:text-lg px-6 py-3">
          <span className="text-xl">📧</span>
          <span>Send to Customer</span>
        </button>
      </div>
    </StepLayout>
  );
}
