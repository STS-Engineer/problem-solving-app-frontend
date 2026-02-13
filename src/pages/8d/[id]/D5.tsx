import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { useStepData } from "../../../hooks/useStepData";

interface D5FormData {}
export default function D5({ onRefreshSteps }: { onRefreshSteps: () => void }) {
  const meta = STEPS.find((s) => s.code === "D5")!;

  const submit = async () => {
    await handleSubmit();
    onRefreshSteps();
  };
  const { loading, saving, data, setData, handleSaveDraft, handleSubmit } =
    useStepData<D5FormData>("D5", {});

  return (
    <StepLayout
      meta={meta}
      onSaveDraft={handleSaveDraft}
      onSubmit={submit}
      saving={saving}
    >
      {/* Section I - Corrective Action for Occurrence */}
      <div className="section">
        <h3>CORRECTIVE ACTION</h3>

        <h4 className="font-semibold text-gray-700 mb-3">
          I. Corrective Action for Occurrence
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[250px] bg-blue-50">Action</th>
                  <th className="min-w-[150px] bg-green-50">Responsible</th>
                  <th className="min-w-[130px] bg-amber-50">Due Date</th>
                  <th className="min-w-[130px] bg-purple-50">Imp Date</th>
                  <th className="min-w-[200px] bg-indigo-50">Evidence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder="Corrective action description..."
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-green-50/30">
                    <input
                      placeholder="Name..."
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-amber-50/30">
                    <input type="date" className="w-full font-medium" />
                  </td>
                  <td className="bg-purple-50/30">
                    <input type="date" className="w-full font-medium" />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input
                      placeholder="Evidence file/reference..."
                      className="w-full font-medium"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder="Corrective action description..."
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-green-50/30">
                    <input
                      placeholder="Name..."
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-amber-50/30">
                    <input type="date" className="w-full font-medium" />
                  </td>
                  <td className="bg-purple-50/30">
                    <input type="date" className="w-full font-medium" />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input
                      placeholder="Evidence file/reference..."
                      className="w-full font-medium"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder="Corrective action description..."
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-green-50/30">
                    <input
                      placeholder="Name..."
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-amber-50/30">
                    <input type="date" className="w-full font-medium" />
                  </td>
                  <td className="bg-purple-50/30">
                    <input type="date" className="w-full font-medium" />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input
                      placeholder="Evidence file/reference..."
                      className="w-full font-medium"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn hover:scale-105 transition-transform text-sm">
            <span>➕</span>
            <span>Add action</span>
          </button>
        </div>
      </div>

      {/* Section II - Corrective Action for Detection */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          II. Corrective Action for Detection
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[250px] bg-blue-50">Action</th>
                  <th className="min-w-[150px] bg-green-50">Responsible</th>
                  <th className="min-w-[130px] bg-amber-50">Due Date</th>
                  <th className="min-w-[130px] bg-purple-50">Imp Date</th>
                  <th className="min-w-[200px] bg-indigo-50">Evidence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder="Detection action description..."
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-green-50/30">
                    <input
                      placeholder="Name..."
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-amber-50/30">
                    <input type="date" className="w-full font-medium" />
                  </td>
                  <td className="bg-purple-50/30">
                    <input type="date" className="w-full font-medium" />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input
                      placeholder="Evidence file/reference..."
                      className="w-full font-medium"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder="Detection action description..."
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-green-50/30">
                    <input
                      placeholder="Name..."
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-amber-50/30">
                    <input type="date" className="w-full font-medium" />
                  </td>
                  <td className="bg-purple-50/30">
                    <input type="date" className="w-full font-medium" />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input
                      placeholder="Evidence file/reference..."
                      className="w-full font-medium"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder="Detection action description..."
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-green-50/30">
                    <input
                      placeholder="Name..."
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-amber-50/30">
                    <input type="date" className="w-full font-medium" />
                  </td>
                  <td className="bg-purple-50/30">
                    <input type="date" className="w-full font-medium" />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input
                      placeholder="Evidence file/reference..."
                      className="w-full font-medium"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn hover:scale-105 transition-transform text-sm">
            <span>➕</span>
            <span>Add action</span>
          </button>
        </div>
      </div>
    </StepLayout>
  );
}
