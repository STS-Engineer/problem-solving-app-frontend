// src/pages/8d/[id]/D7.tsx
import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { useStepData } from "../../../hooks/useStepData";

interface RecurrenceRisk {
  area_line_product: string;
  similar_risk_present: string;
  action_taken: string;
}

interface LessonLearningDissemination {
  audience_team: string;
  method: string;
  date: string;
  owner: string;
  evidence: string;
}

interface ReplicationValidation {
  line_site: string;
  action_replicated: string;
  confirmation_method: string;
  confirmed_by: string;
}

interface KnowledgeBaseUpdate {
  document_type: string;
  topic_reference: string;
  owner: string;
  location_link: string;
}

interface LongTermMonitoring {
  checkpoint_type: string;
  frequency: string;
  owner: string;
  start_date: string;
  notes: string;
}

interface D7FormData {
  recurrence_risks: RecurrenceRisk[];
  lesson_disseminations: LessonLearningDissemination[];
  replication_validations: ReplicationValidation[];
  knowledge_base_updates: KnowledgeBaseUpdate[];
  long_term_monitoring: LongTermMonitoring[];
  ll_conclusion: string;
}

const emptyRisk: RecurrenceRisk = {
  area_line_product: "",
  similar_risk_present: "",
  action_taken: "",
};

const emptyDissemination: LessonLearningDissemination = {
  audience_team: "",
  method: "",
  date: "",
  owner: "",
  evidence: "",
};

const emptyReplication: ReplicationValidation = {
  line_site: "",
  action_replicated: "",
  confirmation_method: "",
  confirmed_by: "",
};

const emptyKB: KnowledgeBaseUpdate = {
  document_type: "",
  topic_reference: "",
  owner: "",
  location_link: "",
};

const emptyMonitoring: LongTermMonitoring = {
  checkpoint_type: "",
  frequency: "",
  owner: "",
  start_date: "",
  notes: "",
};

export default function D7({ onRefreshSteps }: { onRefreshSteps: () => void }) {
  const meta = STEPS.find((s) => s.code === "D7")!;

  const { loading, saving, data, setData, handleSaveDraft, handleSubmit } =
    useStepData<D7FormData>("D7", {
      recurrence_risks: [{ ...emptyRisk }, { ...emptyRisk }],
      lesson_disseminations: [
        { ...emptyDissemination },
        { ...emptyDissemination },
      ],
      replication_validations: [
        { ...emptyReplication },
        { ...emptyReplication },
      ],
      knowledge_base_updates: [{ ...emptyKB }, { ...emptyKB }],
      long_term_monitoring: [{ ...emptyMonitoring }, { ...emptyMonitoring }],
      ll_conclusion: "",
    });

  const submit = async () => {
    await handleSubmit();
    onRefreshSteps();
  };

  // Helper functions for each section
  const updateRisk = (
    index: number,
    field: keyof RecurrenceRisk,
    value: string,
  ) => {
    const updated = [...data.recurrence_risks];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, recurrence_risks: updated });
  };

  const addRisk = () => {
    setData({
      ...data,
      recurrence_risks: [...data.recurrence_risks, { ...emptyRisk }],
    });
  };

  const removeRisk = (index: number) => {
    if (data.recurrence_risks.length <= 1) return;
    const updated = data.recurrence_risks.filter((_, i) => i !== index);
    setData({ ...data, recurrence_risks: updated });
  };

  const updateDissemination = (
    index: number,
    field: keyof LessonLearningDissemination,
    value: string,
  ) => {
    const updated = [...data.lesson_disseminations];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, lesson_disseminations: updated });
  };

  const addDissemination = () => {
    setData({
      ...data,
      lesson_disseminations: [
        ...data.lesson_disseminations,
        { ...emptyDissemination },
      ],
    });
  };

  const removeDissemination = (index: number) => {
    if (data.lesson_disseminations.length <= 1) return;
    const updated = data.lesson_disseminations.filter((_, i) => i !== index);
    setData({ ...data, lesson_disseminations: updated });
  };

  const updateReplication = (
    index: number,
    field: keyof ReplicationValidation,
    value: string,
  ) => {
    const updated = [...data.replication_validations];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, replication_validations: updated });
  };

  const addReplication = () => {
    setData({
      ...data,
      replication_validations: [
        ...data.replication_validations,
        { ...emptyReplication },
      ],
    });
  };

  const removeReplication = (index: number) => {
    if (data.replication_validations.length <= 1) return;
    const updated = data.replication_validations.filter((_, i) => i !== index);
    setData({ ...data, replication_validations: updated });
  };

  const updateKB = (
    index: number,
    field: keyof KnowledgeBaseUpdate,
    value: string,
  ) => {
    const updated = [...data.knowledge_base_updates];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, knowledge_base_updates: updated });
  };

  const addKB = () => {
    setData({
      ...data,
      knowledge_base_updates: [...data.knowledge_base_updates, { ...emptyKB }],
    });
  };

  const removeKB = (index: number) => {
    if (data.knowledge_base_updates.length <= 1) return;
    const updated = data.knowledge_base_updates.filter((_, i) => i !== index);
    setData({ ...data, knowledge_base_updates: updated });
  };

  const updateMonitoring = (
    index: number,
    field: keyof LongTermMonitoring,
    value: string,
  ) => {
    const updated = [...data.long_term_monitoring];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, long_term_monitoring: updated });
  };

  const addMonitoring = () => {
    setData({
      ...data,
      long_term_monitoring: [
        ...data.long_term_monitoring,
        { ...emptyMonitoring },
      ],
    });
  };

  const removeMonitoring = (index: number) => {
    if (data.long_term_monitoring.length <= 1) return;
    const updated = data.long_term_monitoring.filter((_, i) => i !== index);
    setData({ ...data, long_term_monitoring: updated });
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
      {/* Section Title */}
      <div className="section">
        <h3>PREVENTION & REPLICATION TEMPLATE</h3>
      </div>

      {/* Section I - Risk of Recurrence Elsewhere */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          I. RISK OF RECURRENCE ELSEWHERE
        </h4>

        <div className="overflow-x-auto">
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
                <th className="min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.recurrence_risks.map((risk, index) => (
                <tr key={index}>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder="Area/Line/Product..."
                      className="w-full font-medium"
                      value={risk.area_line_product}
                      onChange={(e) =>
                        updateRisk(index, "area_line_product", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-amber-50/30">
                    <select
                      className="w-full font-medium"
                      value={risk.similar_risk_present}
                      onChange={(e) =>
                        updateRisk(
                          index,
                          "similar_risk_present",
                          e.target.value,
                        )
                      }
                    >
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
                      value={risk.action_taken}
                      onChange={(e) =>
                        updateRisk(index, "action_taken", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    {data.recurrence_risks.length > 1 && (
                      <button
                        onClick={() => removeRisk(index)}
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

        <div className="mt-3">
          <button
            onClick={addRisk}
            className="btn text-sm hover:scale-105 transition-transform"
          >
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

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="min-w-[150px] bg-purple-50">Audience / Team</th>
                <th className="min-w-[180px] bg-blue-50">
                  Method (Meeting, LLC, Email)
                </th>
                <th className="min-w-[120px] bg-amber-50">Date</th>
                <th className="min-w-[120px] bg-green-50">Owner</th>
                <th className="min-w-[200px] bg-indigo-50">Evidence</th>
                <th className="min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.lesson_disseminations.map((item, index) => (
                <tr key={index}>
                  <td className="bg-purple-50/30">
                    <input
                      placeholder="Team/Audience..."
                      className="w-full font-medium"
                      value={item.audience_team}
                      onChange={(e) =>
                        updateDissemination(
                          index,
                          "audience_team",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder="Method..."
                      className="w-full font-medium"
                      value={item.method}
                      onChange={(e) =>
                        updateDissemination(index, "method", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-amber-50/30">
                    <input
                      type="date"
                      className="w-full font-medium"
                      value={item.date}
                      onChange={(e) =>
                        updateDissemination(index, "date", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-green-50/30">
                    <input
                      placeholder="Owner..."
                      className="w-full font-medium"
                      value={item.owner}
                      onChange={(e) =>
                        updateDissemination(index, "owner", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input
                      placeholder="Evidence..."
                      className="w-full font-medium"
                      value={item.evidence}
                      onChange={(e) =>
                        updateDissemination(index, "evidence", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    {data.lesson_disseminations.length > 1 && (
                      <button
                        onClick={() => removeDissemination(index)}
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

        <div className="mt-3">
          <button
            onClick={addDissemination}
            className="btn text-sm hover:scale-105 transition-transform"
          >
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

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="min-w-[150px] bg-blue-50">Line / Site</th>
                <th className="min-w-[250px] bg-green-50">Action Replicated</th>
                <th className="min-w-[180px] bg-amber-50">
                  Confirmation Method
                </th>
                <th className="min-w-[150px] bg-purple-50">Confirmed By</th>
                <th className="min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.replication_validations.map((item, index) => (
                <tr key={index}>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder="Line/Site..."
                      className="w-full font-medium"
                      value={item.line_site}
                      onChange={(e) =>
                        updateReplication(index, "line_site", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-green-50/30">
                    <input
                      placeholder="Action..."
                      className="w-full font-medium"
                      value={item.action_replicated}
                      onChange={(e) =>
                        updateReplication(
                          index,
                          "action_replicated",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td className="bg-amber-50/30">
                    <input
                      placeholder="Method..."
                      className="w-full font-medium"
                      value={item.confirmation_method}
                      onChange={(e) =>
                        updateReplication(
                          index,
                          "confirmation_method",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td className="bg-purple-50/30">
                    <input
                      placeholder="Name..."
                      className="w-full font-medium"
                      value={item.confirmed_by}
                      onChange={(e) =>
                        updateReplication(index, "confirmed_by", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    {data.replication_validations.length > 1 && (
                      <button
                        onClick={() => removeReplication(index)}
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

        <div className="mt-3">
          <button
            onClick={addReplication}
            className="btn text-sm hover:scale-105 transition-transform"
          >
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

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="min-w-[150px] bg-indigo-50">Document Type</th>
                <th className="min-w-[250px] bg-blue-50">Topic/Reference</th>
                <th className="min-w-[120px] bg-green-50">Owner</th>
                <th className="min-w-[200px] bg-amber-50">Location / Link</th>
                <th className="min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.knowledge_base_updates.map((item, index) => (
                <tr key={index}>
                  <td className="bg-indigo-50/30">
                    <input
                      placeholder="Document type..."
                      className="w-full font-medium"
                      value={item.document_type}
                      onChange={(e) =>
                        updateKB(index, "document_type", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder="Topic/Reference..."
                      className="w-full font-medium"
                      value={item.topic_reference}
                      onChange={(e) =>
                        updateKB(index, "topic_reference", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-green-50/30">
                    <input
                      placeholder="Owner..."
                      className="w-full font-medium"
                      value={item.owner}
                      onChange={(e) => updateKB(index, "owner", e.target.value)}
                    />
                  </td>
                  <td className="bg-amber-50/30">
                    <input
                      placeholder="Location/Link..."
                      className="w-full font-medium"
                      value={item.location_link}
                      onChange={(e) =>
                        updateKB(index, "location_link", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    {data.knowledge_base_updates.length > 1 && (
                      <button
                        onClick={() => removeKB(index)}
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

        <div className="mt-3">
          <button
            onClick={addKB}
            className="btn text-sm hover:scale-105 transition-transform"
          >
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

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="min-w-[180px] bg-purple-50">Checkpoint Type</th>
                <th className="min-w-[150px] bg-blue-50">Frequency</th>
                <th className="min-w-[120px] bg-green-50">Owner</th>
                <th className="min-w-[120px] bg-amber-50">Start Date</th>
                <th className="min-w-[250px] bg-indigo-50">Notes</th>
                <th className="min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.long_term_monitoring.map((item, index) => (
                <tr key={index}>
                  <td className="bg-purple-50/30">
                    <input
                      placeholder="Checkpoint..."
                      className="w-full font-medium"
                      value={item.checkpoint_type}
                      onChange={(e) =>
                        updateMonitoring(
                          index,
                          "checkpoint_type",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder="Frequency..."
                      className="w-full font-medium"
                      value={item.frequency}
                      onChange={(e) =>
                        updateMonitoring(index, "frequency", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-green-50/30">
                    <input
                      placeholder="Owner..."
                      className="w-full font-medium"
                      value={item.owner}
                      onChange={(e) =>
                        updateMonitoring(index, "owner", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-amber-50/30">
                    <input
                      type="date"
                      className="w-full font-medium"
                      value={item.start_date}
                      onChange={(e) =>
                        updateMonitoring(index, "start_date", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input
                      placeholder="Notes..."
                      className="w-full font-medium"
                      value={item.notes}
                      onChange={(e) =>
                        updateMonitoring(index, "notes", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    {data.long_term_monitoring.length > 1 && (
                      <button
                        onClick={() => removeMonitoring(index)}
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

        <div className="mt-3">
          <button
            onClick={addMonitoring}
            className="btn text-sm hover:scale-105 transition-transform"
          >
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
            value={data.ll_conclusion}
            onChange={(e) =>
              setData({ ...data, ll_conclusion: e.target.value })
            }
          />
        </div>
      </div>
    </StepLayout>
  );
}
