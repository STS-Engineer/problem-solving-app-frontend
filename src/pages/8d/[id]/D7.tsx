import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { useStepData } from "../../../hooks/useStepData";

interface D7FormData {}

export default function D7({ onRefreshSteps }: { onRefreshSteps: () => void }) {
  const meta = STEPS.find((s) => s.code === "D7")!;
  const submit = async () => {
    await handleSubmit();
    onRefreshSteps();
  };
  const { loading, saving, data, setData, handleSaveDraft, handleSubmit } =
    useStepData<D7FormData>("D7", {});

  return (
    <StepLayout
      meta={meta}
      onSaveDraft={handleSaveDraft}
      onSubmit={submit}
      saving={saving}
    >
      {/* Section Title */}
      <div className="section">
        <h3>PREVENTION & REPLICATION TEMPLATE</h3>
      </div>

      {/* Section I - Risk of Recurrence Elsewhere */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          I. RISK OF RECURRENCE ELSEWHERE
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[200px] bg-blue-50">
                    Area / Line / Product
                  </th>
                  <th className="min-w-[180px] bg-amber-50">
                    Similar Risk Present?
                  </th>
                  <th className="min-w-[300px] bg-green-50">Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((n) => (
                  <tr key={n}>
                    <td className="bg-blue-50/30">
                      <input
                        placeholder="Area/Line/Product..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-amber-50/30">
                      <select className="w-full font-medium">
                        <option value="">--</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </td>
                    <td className="bg-green-50/30">
                      <input
                        placeholder="Action description..."
                        className="w-full font-medium"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn text-sm hover:scale-105 transition-transform">
            <span>➕</span>
            <span>Add line</span>
          </button>
        </div>
      </div>

      {/* Section II - Lesson Learning Dissemination */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          II. LESSON LEARNING DISSEMINATION
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[150px] bg-purple-50">
                    Audience / Team
                  </th>
                  <th className="min-w-[180px] bg-blue-50">
                    Method (Meeting, LLC, Email)
                  </th>
                  <th className="min-w-[120px] bg-amber-50">Date</th>
                  <th className="min-w-[120px] bg-green-50">Owner</th>
                  <th className="min-w-[200px] bg-indigo-50">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((n) => (
                  <tr key={n}>
                    <td className="bg-purple-50/30">
                      <input
                        placeholder="Team/Audience..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-blue-50/30">
                      <input
                        placeholder="Method..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-amber-50/30">
                      <input type="date" className="w-full font-medium" />
                    </td>
                    <td className="bg-green-50/30">
                      <input
                        placeholder="Owner..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-indigo-50/30">
                      <input
                        placeholder="Evidence..."
                        className="w-full font-medium"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn text-sm hover:scale-105 transition-transform">
            <span>➕</span>
            <span>Add dissemination</span>
          </button>
        </div>
      </div>

      {/* Section III - Replication Validation */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          III. Replication Validation
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[150px] bg-blue-50">Line / Site</th>
                  <th className="min-w-[250px] bg-green-50">
                    Action Replicated
                  </th>
                  <th className="min-w-[180px] bg-amber-50">
                    Confirmation Method
                  </th>
                  <th className="min-w-[150px] bg-purple-50">Confirmed By</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((n) => (
                  <tr key={n}>
                    <td className="bg-blue-50/30">
                      <input
                        placeholder="Line/Site..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-green-50/30">
                      <input
                        placeholder="Action..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-amber-50/30">
                      <input
                        placeholder="Method..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-purple-50/30">
                      <input
                        placeholder="Name..."
                        className="w-full font-medium"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn text-sm hover:scale-105 transition-transform">
            <span>➕</span>
            <span>Add replication</span>
          </button>
        </div>
      </div>

      {/* Section IV - Knowledge Base Update */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          IV. Knowledge Base Update
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[150px] bg-indigo-50">Document Type</th>
                  <th className="min-w-[250px] bg-blue-50">Topic/Reference</th>
                  <th className="min-w-[120px] bg-green-50">Owner</th>
                  <th className="min-w-[200px] bg-amber-50">Location / Link</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((n) => (
                  <tr key={n}>
                    <td className="bg-indigo-50/30">
                      <input
                        placeholder="Document type..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-blue-50/30">
                      <input
                        placeholder="Topic/Reference..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-green-50/30">
                      <input
                        placeholder="Owner..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-amber-50/30">
                      <input
                        placeholder="Location/Link..."
                        className="w-full font-medium"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn text-sm hover:scale-105 transition-transform">
            <span>➕</span>
            <span>Add document</span>
          </button>
        </div>
      </div>

      {/* Section V - Long-Term Monitoring */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          V. Long-Term Monitoring
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[180px] bg-purple-50">
                    Checkpoint Type
                  </th>
                  <th className="min-w-[150px] bg-blue-50">Frequency</th>
                  <th className="min-w-[120px] bg-green-50">Owner</th>
                  <th className="min-w-[120px] bg-amber-50">Start Date</th>
                  <th className="min-w-[250px] bg-indigo-50">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((n) => (
                  <tr key={n}>
                    <td className="bg-purple-50/30">
                      <input
                        placeholder="Checkpoint..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-blue-50/30">
                      <input
                        placeholder="Frequency..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-green-50/30">
                      <input
                        placeholder="Owner..."
                        className="w-full font-medium"
                      />
                    </td>
                    <td className="bg-amber-50/30">
                      <input type="date" className="w-full font-medium" />
                    </td>
                    <td className="bg-indigo-50/30">
                      <input
                        placeholder="Notes..."
                        className="w-full font-medium"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn text-sm hover:scale-105 transition-transform">
            <span>➕</span>
            <span>Add checkpoint</span>
          </button>
        </div>
      </div>

      {/* Section VI - LL Conclusion */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">VI. LL conclusion</h4>

        <div className="field">
          <textarea
            placeholder="Summarize the lessons learned and conclusion..."
            className="w-full font-medium bg-blue-50 border-blue-200"
            rows={6}
          />
        </div>
      </div>
    </StepLayout>
  );
}
