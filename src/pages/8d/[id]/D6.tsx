import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { useStepData } from "../../../hooks/useStepData";

interface D6FormData {}
export default function D6({ onRefreshSteps }: { onRefreshSteps: () => void }) {
  const meta = STEPS.find((s) => s.code === "D6")!;
  const submit = async () => {
    await handleSubmit();
    onRefreshSteps();
  };
  const { loading, saving, data, setData, handleSaveDraft, handleSubmit } =
    useStepData<D6FormData>("D6", {});

  return (
    <StepLayout
      meta={meta}
      onSaveDraft={handleSaveDraft}
      onSubmit={submit}
      saving={saving}
    >
      {/* Section II - Implementation & Effectiveness Check - Monitoring */}
      <div className="section">
        <h3>Implementation & Effectiveness Check</h3>

        <h4 className="font-semibold text-gray-700 mb-3">
          II. Implementation & Effectiveness Check
        </h4>

        <div className="appGrid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="field">
            <label className="text-sm font-medium">
              Monitoring interval of time
            </label>
            <input
              type="text"
              placeholder="e.g., 3 shifts, 1 week..."
              className="w-full font-medium"
            />
          </div>

          <div className="field">
            <label className="text-sm font-medium">
              Number of pieces produced
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full font-bold text-lg"
            />
          </div>

          <div className="field">
            <label className="text-sm font-medium">Rejection rate</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full font-bold text-lg"
              />
              <span className="font-bold">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="field">
            <label className="text-sm font-medium">Audited by</label>
            <input
              type="text"
              placeholder="Name and title..."
              className="w-full font-medium"
            />
          </div>

          <div className="field">
            <label className="text-sm font-medium">Date</label>
            <input type="date" className="w-full font-medium" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="field">
            <label className="text-sm font-medium">Shift 1</label>
            <input type="text" placeholder="Data..." className="w-full" />
          </div>

          <div className="field">
            <label className="text-sm font-medium">Shift 2</label>
            <input type="text" placeholder="Data..." className="w-full" />
          </div>
        </div>
      </div>

      {/* Section III - Implementation Checklist */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          III. Implementation & Effectiveness Check
        </h4>

        <div className="space-y-2">
          {[
            "Have parameters been corrected in safety/working instructions?",
            "Do working instructions match with Control Plan and PFMEA?",
            "Are the instructions clear?",
            "Are critical points clearly described?",
            "Does actual process match with the operating instructions?",
            "Does actual process match with the expected corrective actions?",
            "Are operators aware of the incident?",
            "Are operators training about all process modification?",
            "Has the solution properly validated in the floorshop?",
            "Is there a clear visual aid published in visible spot?",
            "Is the equipment modified vs the corrective actions?",
            "Is the maintenance record modified?",
            "Is the set up instruction modified? Match with CP?",
          ].map((question, idx) => (
            <label
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                className="w-5 h-5 mt-0.5 rounded border-2"
              />
              <span className="font-medium text-gray-800 flex-1">
                {question}
              </span>
            </label>
          ))}
        </div>
      </div>
    </StepLayout>
  );
}
