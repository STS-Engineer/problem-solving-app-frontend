import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { useStepData } from "../../../hooks/useStepData";
import { getStepByComplaintCode } from "../../../services/api/reports";

interface CorrectiveActionImplementation {
  action: string;
  responsible: string;
  due_date: string;
  imp_date: string;
  evidence: string;
}

interface ImplementationMonitoring {
  monitoring_interval: string;
  pieces_produced: number | null;
  rejection_rate: number | null;
  audited_by: string;
  audit_date: string;
  shift_1_data: string;
  shift_2_data: string;
}

interface ChecklistItem {
  question: string;
  checked: boolean;
  shift_1: boolean;
  shift_2: boolean;
  shift_3: boolean;
}

interface D6FormData {
  corrective_actions_occurrence: CorrectiveActionImplementation[];
  corrective_actions_detection: CorrectiveActionImplementation[];
  monitoring: ImplementationMonitoring;
  checklist: ChecklistItem[];
}

const DEFAULT_QUESTIONS = [
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
];

const DEFAULT_DATA: D6FormData = {
  corrective_actions_occurrence: [],
  corrective_actions_detection: [],
  monitoring: {
    monitoring_interval: "",
    pieces_produced: null,
    rejection_rate: null,
    audited_by: "",
    audit_date: "",
    shift_1_data: "",
    shift_2_data: "",
  },
  checklist: DEFAULT_QUESTIONS.map((q) => ({
    question: q,
    checked: false,
    shift_1: false,
    shift_2: false,
    shift_3: false,
  })),
};

export default function D6({ onRefreshSteps }: { onRefreshSteps: () => void }) {
  const meta = STEPS.find((s) => s.code === "D6")!;
  const { complaintId } = useParams<{ complaintId: string }>();
  const [d5Actions, setD5Actions] = useState<{
    occurrence: any[];
    detection: any[];
  } | null>(null);
  const [loadingD5, setLoadingD5] = useState(true);
  const [d5Initialized, setD5Initialized] = useState(false);

  const { loading, saving, data, setData, handleSaveDraft, handleSubmit } =
    useStepData<D6FormData>("D6", DEFAULT_DATA);

  // Ensure monitoring is always an object (fix for null values from backend)
  useEffect(() => {
    if (data && !data.monitoring) {
      setData({
        ...data,
        monitoring: DEFAULT_DATA.monitoring,
      });
    }
    if (data && data.monitoring && typeof data.monitoring !== "object") {
      setData({
        ...data,
        monitoring: DEFAULT_DATA.monitoring,
      });
    }
    if (data && (!data.checklist || data.checklist.length === 0)) {
      setData({
        ...data,
        checklist: DEFAULT_DATA.checklist,
      });
    }
  }, []);

  // Fetch D5 data when component mounts
  useEffect(() => {
    const fetchD5Data = async () => {
      try {
        setLoadingD5(true);

        if (!complaintId) {
          console.error("No complaint ID found");
          setLoadingD5(false);
          return;
        }

        // Fetch D5 step data using the same API function
        const d5Step = await getStepByComplaintCode(Number(complaintId), "D5");

        if (d5Step && d5Step.data) {
          const d5Data = d5Step.data;

          setD5Actions({
            occurrence: d5Data.corrective_actions_occurrence || [],
            detection: d5Data.corrective_actions_detection || [],
          });

          // Initialize D6 corrective actions from D5 ONLY if:
          // 1. D6 has no actions yet (fresh start)
          // 2. D5 has actions
          // 3. Not already initialized
          const hasD6Actions =
            data.corrective_actions_occurrence.length > 0 ||
            data.corrective_actions_detection.length > 0;

          const hasD5Actions =
            (d5Data.corrective_actions_occurrence?.length || 0) > 0 ||
            (d5Data.corrective_actions_detection?.length || 0) > 0;

          if (!hasD6Actions && hasD5Actions && !d5Initialized) {
            setData((prevData) => ({
              ...prevData,
              corrective_actions_occurrence:
                d5Data.corrective_actions_occurrence?.map((action: any) => ({
                  action: action.action || "",
                  responsible: action.responsible || "",
                  due_date: action.due_date || "",
                  imp_date: "",
                  evidence: "",
                })) || [],
              corrective_actions_detection:
                d5Data.corrective_actions_detection?.map((action: any) => ({
                  action: action.action || "",
                  responsible: action.responsible || "",
                  due_date: action.due_date || "",
                  imp_date: "",
                  evidence: "",
                })) || [],
            }));
            setD5Initialized(true);
          }
        }
      } catch (error) {
        console.error("Error fetching D5 data:", error);
      } finally {
        setLoadingD5(false);
      }
    };

    if (complaintId && !loading) {
      fetchD5Data();
    }
  }, [complaintId, loading]);

  const submit = async () => {
    await handleSubmit();
    onRefreshSteps();
  };

  const updateOccurrenceAction = (
    index: number,
    field: keyof CorrectiveActionImplementation,
    value: string,
  ) => {
    const updated = [...data.corrective_actions_occurrence];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, corrective_actions_occurrence: updated });
  };

  const updateDetectionAction = (
    index: number,
    field: keyof CorrectiveActionImplementation,
    value: string,
  ) => {
    const updated = [...data.corrective_actions_detection];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, corrective_actions_detection: updated });
  };

  const updateMonitoring = (
    field: keyof ImplementationMonitoring,
    value: any,
  ) => {
    setData({
      ...data,
      monitoring: {
        ...(data.monitoring || DEFAULT_DATA.monitoring),
        [field]: value,
      },
    });
  };

  const updateChecklistItem = (
    index: number,
    field: keyof ChecklistItem,
    value: boolean,
  ) => {
    const currentChecklist =
      data.checklist && data.checklist.length > 0
        ? data.checklist
        : DEFAULT_DATA.checklist;
    const updated = [...currentChecklist];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, checklist: updated });
  };

  if (loading || loadingD5) {
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
      {/* Section I - Implementation of Corrective Actions (from D5) */}
      <div className="section">
        <h3>I. Implementation & Effectiveness Check</h3>

        {d5Actions &&
        (d5Actions.occurrence.length > 0 || d5Actions.detection.length > 0) ? (
          <>
            {/* Occurrence Actions */}
            {data.corrective_actions_occurrence.length > 0 && (
              <>
                <h4 className="font-semibold text-gray-700 mb-3">
                  Corrective Actions for Occurrence
                </h4>

                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th className="min-w-[250px] bg-blue-50">
                            Corrective Action for Occurrence
                          </th>
                          <th className="min-w-[150px] bg-green-50">
                            Responsible
                          </th>
                          <th className="min-w-[130px] bg-amber-50">
                            Due Date
                          </th>
                          <th className="min-w-[130px] bg-purple-50">
                            Imp Date
                          </th>
                          <th className="min-w-[200px] bg-indigo-50">
                            Evidence
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.corrective_actions_occurrence.map(
                          (action, index) => (
                            <tr key={index}>
                              <td className="bg-blue-50/30">
                                <div className="w-full font-medium text-gray-700 p-2">
                                  {action.action || "—"}
                                </div>
                              </td>
                              <td className="bg-green-50/30">
                                <div className="w-full font-medium text-gray-700 p-2">
                                  {action.responsible || "—"}
                                </div>
                              </td>
                              <td className="bg-amber-50/30">
                                <div className="w-full font-medium text-gray-700 p-2">
                                  {action.due_date || "—"}
                                </div>
                              </td>
                              <td className="bg-purple-50/30">
                                <input
                                  type="date"
                                  className="w-full font-medium"
                                  value={action.imp_date}
                                  onChange={(e) =>
                                    updateOccurrenceAction(
                                      index,
                                      "imp_date",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td className="bg-indigo-50/30">
                                <input
                                  placeholder="Evidence file/reference..."
                                  className="w-full font-medium"
                                  value={action.evidence}
                                  onChange={(e) =>
                                    updateOccurrenceAction(
                                      index,
                                      "evidence",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Detection Actions */}
            {data.corrective_actions_detection.length > 0 && (
              <>
                <h4 className="font-semibold text-gray-700 mb-3 mt-6">
                  Corrective Actions for Detection
                </h4>

                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th className="min-w-[250px] bg-blue-50">
                            Corrective Action for Detection
                          </th>
                          <th className="min-w-[150px] bg-green-50">
                            Responsible
                          </th>
                          <th className="min-w-[130px] bg-amber-50">
                            Due Date
                          </th>
                          <th className="min-w-[130px] bg-purple-50">
                            Imp Date
                          </th>
                          <th className="min-w-[200px] bg-indigo-50">
                            Evidence
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.corrective_actions_detection.map(
                          (action, index) => (
                            <tr key={index}>
                              <td className="bg-blue-50/30">
                                <div className="w-full font-medium text-gray-700 p-2">
                                  {action.action || "—"}
                                </div>
                              </td>
                              <td className="bg-green-50/30">
                                <div className="w-full font-medium text-gray-700 p-2">
                                  {action.responsible || "—"}
                                </div>
                              </td>
                              <td className="bg-amber-50/30">
                                <div className="w-full font-medium text-gray-700 p-2">
                                  {action.due_date || "—"}
                                </div>
                              </td>
                              <td className="bg-purple-50/30">
                                <input
                                  type="date"
                                  className="w-full font-medium"
                                  value={action.imp_date}
                                  onChange={(e) =>
                                    updateDetectionAction(
                                      index,
                                      "imp_date",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td className="bg-indigo-50/30">
                                <input
                                  placeholder="Evidence file/reference..."
                                  className="w-full font-medium"
                                  value={action.evidence}
                                  onChange={(e) =>
                                    updateDetectionAction(
                                      index,
                                      "evidence",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              ⚠️ No corrective actions found from D5. Please complete D5 first.
            </p>
          </div>
        )}
      </div>

      {/* Section II - Implementation & Effectiveness Check - Monitoring */}
      <div className="section">
        <h3>II. Implementation & Effectiveness Check - Monitoring</h3>

        <div className="appGrid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="field">
            <label className="text-sm font-medium">
              Monitoring interval of time
            </label>
            <input
              type="text"
              placeholder="e.g., 3 shifts, 1 week..."
              className="w-full font-medium"
              value={data.monitoring?.monitoring_interval ?? ""}
              onChange={(e) =>
                updateMonitoring("monitoring_interval", e.target.value)
              }
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
              value={data.monitoring?.pieces_produced ?? ""}
              onChange={(e) =>
                updateMonitoring(
                  "pieces_produced",
                  e.target.value ? parseInt(e.target.value) : null,
                )
              }
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
                value={data.monitoring?.rejection_rate ?? ""}
                onChange={(e) =>
                  updateMonitoring(
                    "rejection_rate",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
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
              value={data.monitoring?.audited_by ?? ""}
              onChange={(e) => updateMonitoring("audited_by", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              className="w-full font-medium"
              value={data.monitoring?.audit_date ?? ""}
              onChange={(e) => updateMonitoring("audit_date", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="field">
            <label className="text-sm font-medium">Shift 1</label>
            <input
              type="text"
              placeholder="Data..."
              className="w-full"
              value={data.monitoring?.shift_1_data ?? ""}
              onChange={(e) => updateMonitoring("shift_1_data", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="text-sm font-medium">Shift 2</label>
            <input
              type="text"
              placeholder="Data..."
              className="w-full"
              value={data.monitoring?.shift_2_data ?? ""}
              onChange={(e) => updateMonitoring("shift_2_data", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Section III - Implementation Checklist */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          III. Implementation & Effectiveness Check - Checklist
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[400px] bg-gray-50">Question</th>
                  <th className="min-w-[100px] bg-blue-50 text-center">
                    Shift 1
                  </th>
                  <th className="min-w-[100px] bg-green-50 text-center">
                    Shift 2
                  </th>
                  <th className="min-w-[100px] bg-amber-50 text-center">
                    Shift 3
                  </th>
                </tr>
              </thead>
              <tbody>
                {(data.checklist && data.checklist.length > 0
                  ? data.checklist
                  : DEFAULT_DATA.checklist
                ).map((item, idx) => (
                  <tr key={idx}>
                    <td className="bg-gray-50/30">
                      <span className="font-medium text-gray-800">
                        {item.question}
                      </span>
                    </td>
                    <td className="bg-blue-50/30 text-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-2"
                        checked={item.shift_1}
                        onChange={(e) =>
                          updateChecklistItem(idx, "shift_1", e.target.checked)
                        }
                      />
                    </td>
                    <td className="bg-green-50/30 text-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-2"
                        checked={item.shift_2}
                        onChange={(e) =>
                          updateChecklistItem(idx, "shift_2", e.target.checked)
                        }
                      />
                    </td>
                    <td className="bg-amber-50/30 text-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-2"
                        checked={item.shift_3}
                        onChange={(e) =>
                          updateChecklistItem(idx, "shift_3", e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
