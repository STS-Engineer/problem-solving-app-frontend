// src/pages/8d/[id]/D4.tsx
import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { useStepData } from "../../../hooks/useStepData";

interface FourMRow {
  material: string;
  method: string;
  machine: string;
  manpower: string;
  environment: string;
}

interface FourMEnvironment {
  row_1: FourMRow;
  row_2: FourMRow;
  row_3: FourMRow;
  selected_problem: string;
}

interface FiveWhyItem {
  question: string;
  answer: string;
}

interface FiveWhys {
  why_1: FiveWhyItem;
  why_2: FiveWhyItem;
  why_3: FiveWhyItem;
  why_4: FiveWhyItem;
  why_5: FiveWhyItem;
}

interface RootCauseConclusion {
  root_cause: string;
  validation_method: string;
}

interface D4FormData {
  four_m_occurrence: FourMEnvironment;
  five_whys_occurrence: FiveWhys;
  root_cause_occurrence: RootCauseConclusion;
  four_m_non_detection: FourMEnvironment;
  five_whys_non_detection: FiveWhys;
  root_cause_non_detection: RootCauseConclusion;
}

const emptyFourMRow: FourMRow = {
  material: "",
  method: "",
  machine: "",
  manpower: "",
  environment: "",
};

const emptyFourM: FourMEnvironment = {
  row_1: { ...emptyFourMRow },
  row_2: { ...emptyFourMRow },
  row_3: { ...emptyFourMRow },
  selected_problem: "",
};

const emptyWhyItem: FiveWhyItem = { question: "", answer: "" };

const emptyFiveWhys: FiveWhys = {
  why_1: { ...emptyWhyItem },
  why_2: { ...emptyWhyItem },
  why_3: { ...emptyWhyItem },
  why_4: { ...emptyWhyItem },
  why_5: { ...emptyWhyItem },
};

const emptyRootCause: RootCauseConclusion = {
  root_cause: "",
  validation_method: "",
};

export default function D4({ onRefreshSteps }: { onRefreshSteps: () => void }) {
  const meta = STEPS.find((s) => s.code === "D4")!;

  const { loading, saving, data, setData, handleSaveDraft, handleSubmit } =
    useStepData<D4FormData>("D4", {
      four_m_occurrence: { ...emptyFourM },
      five_whys_occurrence: { ...emptyFiveWhys },
      root_cause_occurrence: { ...emptyRootCause },
      four_m_non_detection: { ...emptyFourM },
      five_whys_non_detection: { ...emptyFiveWhys },
      root_cause_non_detection: { ...emptyRootCause },
    });

  const submit = async () => {
    await handleSubmit();
    onRefreshSteps();
  };

  const updateOccurrence4M = (
    rowKey: "row_1" | "row_2" | "row_3",
    field: keyof FourMRow,
    value: string,
  ) => {
    setData({
      ...data,
      four_m_occurrence: {
        ...data.four_m_occurrence,
        [rowKey]: {
          ...data.four_m_occurrence[rowKey],
          [field]: value,
        },
      },
    });
  };

  const updateNonDetection4M = (
    rowKey: "row_1" | "row_2" | "row_3",
    field: keyof FourMRow,
    value: string,
  ) => {
    setData({
      ...data,
      four_m_non_detection: {
        ...data.four_m_non_detection,
        [rowKey]: {
          ...data.four_m_non_detection[rowKey],
          [field]: value,
        },
      },
    });
  };

  const updateOccurrenceWhy = (
    whyKey: keyof FiveWhys,
    field: "question" | "answer",
    value: string,
  ) => {
    setData({
      ...data,
      five_whys_occurrence: {
        ...data.five_whys_occurrence,
        [whyKey]: {
          ...data.five_whys_occurrence[whyKey],
          [field]: value,
        },
      },
    });
  };

  const updateNonDetectionWhy = (
    whyKey: keyof FiveWhys,
    field: "question" | "answer",
    value: string,
  ) => {
    setData({
      ...data,
      five_whys_non_detection: {
        ...data.five_whys_non_detection,
        [whyKey]: {
          ...data.five_whys_non_detection[whyKey],
          [field]: value,
        },
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
      {/* Section I - 4M + Environment OCCURRENCE */}
      <div className="section">
        <h3>Root Cause Analysis</h3>

        <h4 className="font-semibold text-gray-700 mb-3">
          I. Define potential root cause for 4M+ Environment - OCCURRENCE
        </h4>

        <div className="overflow-x-auto">
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
              {(["row_1", "row_2", "row_3"] as const).map((rowKey, idx) => (
                <tr key={rowKey}>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder={`A${idx + 1}`}
                      className="w-full font-medium"
                      value={data.four_m_occurrence[rowKey].material}
                      onChange={(e) =>
                        updateOccurrence4M(rowKey, "material", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-purple-50/30">
                    <input
                      placeholder={`E${idx + 1}`}
                      className="w-full font-medium"
                      value={data.four_m_occurrence[rowKey].method}
                      onChange={(e) =>
                        updateOccurrence4M(rowKey, "method", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-orange-50/30">
                    <input
                      placeholder={`C${idx + 1}`}
                      className="w-full font-medium"
                      value={data.four_m_occurrence[rowKey].machine}
                      onChange={(e) =>
                        updateOccurrence4M(rowKey, "machine", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-green-50/30">
                    <input
                      placeholder={`N${idx + 1}`}
                      className="w-full font-medium"
                      value={data.four_m_occurrence[rowKey].manpower}
                      onChange={(e) =>
                        updateOccurrence4M(rowKey, "manpower", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input
                      placeholder={`S${idx + 1}`}
                      className="w-full font-medium"
                      value={data.four_m_occurrence[rowKey].environment}
                      onChange={(e) =>
                        updateOccurrence4M(
                          rowKey,
                          "environment",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  {idx === 0 && (
                    <td rowSpan={3} className="bg-gray-50">
                      <textarea
                        placeholder="Select the problem root cause..."
                        className="w-full h-full resize-none"
                        rows={4}
                        value={data.four_m_occurrence.selected_problem}
                        onChange={(e) =>
                          setData({
                            ...data,
                            four_m_occurrence: {
                              ...data.four_m_occurrence,
                              selected_problem: e.target.value,
                            },
                          })
                        }
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section II - 5 Whys OCCURRENCE */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          II. 5 Whys (Occurrence) for selected Root causes
        </h4>

        <div className="space-y-4">
          {(["why_1", "why_2", "why_3", "why_4", "why_5"] as const).map(
            (whyKey, idx) => (
              <div key={whyKey} className="border rounded-lg p-4 bg-gray-50">
                <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span>{idx + 1}st Why?</span>
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
                      value={data.five_whys_occurrence[whyKey].question}
                      onChange={(e) =>
                        updateOccurrenceWhy(whyKey, "question", e.target.value)
                      }
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
                      value={data.five_whys_occurrence[whyKey].answer}
                      onChange={(e) =>
                        updateOccurrenceWhy(whyKey, "answer", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ),
          )}
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
              value={data.root_cause_occurrence.root_cause}
              onChange={(e) =>
                setData({
                  ...data,
                  root_cause_occurrence: {
                    ...data.root_cause_occurrence,
                    root_cause: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="field">
            <label className="text-sm font-medium">How was it validated?</label>
            <textarea
              placeholder="Validation method..."
              className="w-full font-medium bg-green-50 border-green-200"
              rows={4}
              value={data.root_cause_occurrence.validation_method}
              onChange={(e) =>
                setData({
                  ...data,
                  root_cause_occurrence: {
                    ...data.root_cause_occurrence,
                    validation_method: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Section IV - 4M NON-DETECTION */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          IV. Define potential root cause for 4M+ Environment - NON DETECTION
        </h4>

        <div className="overflow-x-auto">
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
              {(["row_1", "row_2", "row_3"] as const).map((rowKey, idx) => (
                <tr key={rowKey}>
                  <td className="bg-blue-50/30">
                    <input
                      placeholder={`A${idx + 1}`}
                      className="w-full font-medium"
                      value={data.four_m_non_detection[rowKey].material}
                      onChange={(e) =>
                        updateNonDetection4M(rowKey, "material", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-purple-50/30">
                    <input
                      placeholder={`E${idx + 1}`}
                      className="w-full font-medium"
                      value={data.four_m_non_detection[rowKey].method}
                      onChange={(e) =>
                        updateNonDetection4M(rowKey, "method", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-orange-50/30">
                    <input
                      placeholder={`C${idx + 1}`}
                      className="w-full font-medium"
                      value={data.four_m_non_detection[rowKey].machine}
                      onChange={(e) =>
                        updateNonDetection4M(rowKey, "machine", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-green-50/30">
                    <input
                      placeholder={`N${idx + 1}`}
                      className="w-full font-medium"
                      value={data.four_m_non_detection[rowKey].manpower}
                      onChange={(e) =>
                        updateNonDetection4M(rowKey, "manpower", e.target.value)
                      }
                    />
                  </td>
                  <td className="bg-indigo-50/30">
                    <input
                      placeholder={`S${idx + 1}`}
                      className="w-full font-medium"
                      value={data.four_m_non_detection[rowKey].environment}
                      onChange={(e) =>
                        updateNonDetection4M(
                          rowKey,
                          "environment",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  {idx === 0 && (
                    <td rowSpan={3} className="bg-gray-50">
                      <textarea
                        placeholder="Select the problem root cause..."
                        className="w-full h-full resize-none"
                        rows={4}
                        value={data.four_m_non_detection.selected_problem}
                        onChange={(e) =>
                          setData({
                            ...data,
                            four_m_non_detection: {
                              ...data.four_m_non_detection,
                              selected_problem: e.target.value,
                            },
                          })
                        }
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section V - 5 Whys NON-DETECTION */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          V. 5 Whys (Non Detection) for selected Root causes
        </h4>

        <div className="space-y-4">
          {(["why_1", "why_2", "why_3", "why_4", "why_5"] as const).map(
            (whyKey, idx) => (
              <div key={whyKey} className="border rounded-lg p-4 bg-gray-50">
                <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-600 text-white text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span>{idx + 1}st Why?</span>
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
                      value={data.five_whys_non_detection[whyKey].question}
                      onChange={(e) =>
                        updateNonDetectionWhy(
                          whyKey,
                          "question",
                          e.target.value,
                        )
                      }
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
                      value={data.five_whys_non_detection[whyKey].answer}
                      onChange={(e) =>
                        updateNonDetectionWhy(whyKey, "answer", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ),
          )}
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
              value={data.root_cause_non_detection.root_cause}
              onChange={(e) =>
                setData({
                  ...data,
                  root_cause_non_detection: {
                    ...data.root_cause_non_detection,
                    root_cause: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="field">
            <label className="text-sm font-medium">How was it validated?</label>
            <textarea
              placeholder="Validation method..."
              className="w-full font-medium bg-green-50 border-green-200"
              rows={4}
              value={data.root_cause_non_detection.validation_method}
              onChange={(e) =>
                setData({
                  ...data,
                  root_cause_non_detection: {
                    ...data.root_cause_non_detection,
                    validation_method: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
