import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { useStepData } from "../../../hooks/useStepData";

interface D4FormData {}
export default function D4({ onRefreshSteps }: { onRefreshSteps: () => void }) {
  const meta = STEPS.find((s) => s.code === "D4")!;
  const submit = async () => {
    await handleSubmit();
    onRefreshSteps();
  };
  const { loading, saving, data, setData, handleSaveDraft, handleSubmit } =
    useStepData<D4FormData>("D4", {});
  return (
    <StepLayout
      meta={meta}
      onSaveDraft={handleSaveDraft}
      onSubmit={submit}
      saving={saving}
    >
      {/* Section I - 4M + Environment OCCURRENCE */}
      <div className="section">
        <h3>Root Cause Analysis</h3>

        <h4 className="font-semibold text-gray-700 mb-3">
          I. Define potential root cause for 4M+ Environment - OCCURRENCE
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[150px] bg-blue-50">Material</th>
                  <th className="min-w-[150px] bg-purple-50">Method</th>
                  <th className="min-w-[150px] bg-orange-50">Machine</th>
                  <th className="min-w-[150px] bg-green-50">Manpower</th>
                  <th className="min-w-[150px] bg-indigo-50">Environment</th>
                  <th className="min-w-[120px] bg-gray-100">Problem</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bg-blue-50/30">
                    <input placeholder="A1" className="w-full font-medium" />
                  </td>
                  <td className="bg-purple-50/30">
                    <input placeholder="E1" className="w-full font-medium" />
                  </td>
                  <td className="bg-orange-50/30">
                    <input placeholder="C1" className="w-full font-medium" />
                  </td>
                  <td className="bg-green-50/30">
                    <input placeholder="N1" className="w-full font-medium" />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input placeholder="S1" className="w-full font-medium" />
                  </td>
                  <td rowSpan={3} className="bg-gray-50">
                    <textarea
                      placeholder="Select the problem root cause..."
                      className="w-full h-full resize-none"
                      rows={4}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="bg-blue-50/30">
                    <input placeholder="A2" className="w-full font-medium" />
                  </td>
                  <td className="bg-purple-50/30">
                    <input placeholder="E2" className="w-full font-medium" />
                  </td>
                  <td className="bg-orange-50/30">
                    <input placeholder="C2" className="w-full font-medium" />
                  </td>
                  <td className="bg-green-50/30">
                    <input placeholder="N2" className="w-full font-medium" />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input placeholder="S2" className="w-full font-medium" />
                  </td>
                </tr>
                <tr>
                  <td className="bg-blue-50/30">
                    <input placeholder="A3" className="w-full font-medium" />
                  </td>
                  <td className="bg-purple-50/30">
                    <input placeholder="E3" className="w-full font-medium" />
                  </td>
                  <td className="bg-orange-50/30">
                    <input placeholder="C3" className="w-full font-medium" />
                  </td>
                  <td className="bg-green-50/30">
                    <input placeholder="N3" className="w-full font-medium" />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input placeholder="S3" className="w-full font-medium" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section II - 5 Whys OCCURRENCE */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          II. 5 Whys (Occurrence) for selected Root causes
        </h4>

        <div className="space-y-4">
          {[
            { n: 1, label: "1st Why?" },
            { n: 2, label: "2st Why?" },
            { n: 3, label: "3st Why?" },
            { n: 4, label: "4st Why?" },
            { n: 5, label: "5st Why?" },
          ].map((item) => (
            <div key={item.n} className="border rounded-lg p-4 bg-gray-50">
              <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">
                  {item.n}
                </span>
                <span>{item.label}</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Question:
                  </label>
                  <input
                    type="text"
                    placeholder="Question..."
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Answer:
                  </label>
                  <textarea
                    placeholder="Answer..."
                    className="w-full mt-1"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section III - Root cause for Occurrence */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          III. Root cause for Occurrence
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="field">
            <label className="text-sm font-medium">Root Cause</label>
            <textarea
              placeholder="Describe the root cause for occurrence..."
              className="w-full font-medium bg-red-50 border-red-200"
              rows={4}
            />
          </div>
          <div className="field">
            <label className="text-sm font-medium">How was it validated?</label>
            <textarea
              placeholder="Validation method..."
              className="w-full font-medium bg-green-50 border-green-200"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Section IV - 4M + Environment NON-DETECTION */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          IV. Define potential root cause for 4M+ Environment - NON DETECTION
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[150px] bg-blue-50">Material</th>
                  <th className="min-w-[150px] bg-purple-50">Method</th>
                  <th className="min-w-[150px] bg-orange-50">Machine</th>
                  <th className="min-w-[150px] bg-green-50">Manpower</th>
                  <th className="min-w-[150px] bg-indigo-50">Environment</th>
                  <th className="min-w-[120px] bg-gray-100">Problem</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bg-blue-50/30">
                    <input placeholder="A1" className="w-full font-medium" />
                  </td>
                  <td className="bg-purple-50/30">
                    <input placeholder="E1" className="w-full font-medium" />
                  </td>
                  <td className="bg-orange-50/30">
                    <input placeholder="C1" className="w-full font-medium" />
                  </td>
                  <td className="bg-green-50/30">
                    <input placeholder="N1" className="w-full font-medium" />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input placeholder="S1" className="w-full font-medium" />
                  </td>
                  <td rowSpan={3} className="bg-gray-50">
                    <textarea
                      placeholder="Select the problem root cause..."
                      className="w-full h-full resize-none"
                      rows={4}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="bg-blue-50/30">
                    <input placeholder="A2" className="w-full font-medium" />
                  </td>
                  <td className="bg-purple-50/30">
                    <input placeholder="E2" className="w-full font-medium" />
                  </td>
                  <td className="bg-orange-50/30">
                    <input placeholder="C2" className="w-full font-medium" />
                  </td>
                  <td className="bg-green-50/30">
                    <input placeholder="N2" className="w-full font-medium" />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input placeholder="S2" className="w-full font-medium" />
                  </td>
                </tr>
                <tr>
                  <td className="bg-blue-50/30">
                    <input placeholder="A3" className="w-full font-medium" />
                  </td>
                  <td className="bg-purple-50/30">
                    <input placeholder="E3" className="w-full font-medium" />
                  </td>
                  <td className="bg-orange-50/30">
                    <input placeholder="C3" className="w-full font-medium" />
                  </td>
                  <td className="bg-green-50/30">
                    <input placeholder="N3" className="w-full font-medium" />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input placeholder="S3" className="w-full font-medium" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section V - 5 Whys NON-DETECTION */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          V. 5 Whys (Non Detection) for selected Root causes
        </h4>

        <div className="space-y-4">
          {[
            { n: 1, label: "1st Why?" },
            { n: 2, label: "2st Why?" },
            { n: 3, label: "3st Why?" },
            { n: 4, label: "4st Why?" },
            { n: 5, label: "5st Why?" },
          ].map((item) => (
            <div key={item.n} className="border rounded-lg p-4 bg-gray-50">
              <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-600 text-white text-sm font-bold">
                  {item.n}
                </span>
                <span>{item.label}</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Question:
                  </label>
                  <input
                    type="text"
                    placeholder="Question..."
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Answer:
                  </label>
                  <textarea
                    placeholder="Answer..."
                    className="w-full mt-1"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section VI - Root cause for NON-DETECTION */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          VI. Root cause for NON-DETECTION
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="field">
            <label className="text-sm font-medium">Root Cause</label>
            <textarea
              placeholder="Describe the root cause for non-detection..."
              className="w-full font-medium bg-orange-50 border-orange-200"
              rows={4}
            />
          </div>
          <div className="field">
            <label className="text-sm font-medium">How was it validated?</label>
            <textarea
              placeholder="Validation method..."
              className="w-full font-medium bg-green-50 border-green-200"
              rows={4}
            />
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
