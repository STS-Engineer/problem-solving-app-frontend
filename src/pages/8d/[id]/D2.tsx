// src/pages/8d/[id]/D2.tsx
import { useStepData } from "../../../hooks/useStepData";
import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { ValidationResult } from "../../../services/api/reports";
import ValidationSpinner from "../../../components/ValidationSpinner";
import EvidenceUploader from "../../../components/EvidenceUploader";

interface FourW2H {
  what: string;
  where: string;
  when: string;
  who: string;
  how: string;
  how_many: string;
}

interface IsIsNotFactor {
  factor: string;
  is_problem: string;
  is_not_problem: string;
}

interface D2FormData {
  problem_description: string;
  four_w_2h: FourW2H;
  standard_applicable: string;
  expected_situation: string;
  observed_situation: string;
  // evidence_documents is now managed by EvidenceUploader (stored in step_files table)
  // We keep it for backwards-compat but no longer render a text input for it
  evidence_documents: string;
  is_is_not_factors: IsIsNotFactor[];
  estimated_cost: number;
  cost_currency: string;
  customer_impact: string;
  additional_notes: string;
}

interface D2Props {
  onRefreshSteps: () => void;
  onValidationUpdate: (validation: ValidationResult | null) => void;
}

export default function D2({ onRefreshSteps, onValidationUpdate }: D2Props) {
  const meta = STEPS.find((s) => s.code === "D2")!;

  const {
    loading,
    saving,
    validating,
    stepId,
    data,
    setData,
    handleSaveDraft,
    handleSubmit,
  } = useStepData<D2FormData>("D2", {
    problem_description: "",
    four_w_2h: {
      what: "",
      where: "",
      when: "",
      who: "",
      how: "",
      how_many: "",
    },
    standard_applicable: "",
    expected_situation: "",
    observed_situation: "",
    evidence_documents: "",
    is_is_not_factors: [
      { factor: "Product", is_problem: "", is_not_problem: "" },
      { factor: "Time", is_problem: "", is_not_problem: "" },
      { factor: "Lot", is_problem: "", is_not_problem: "" },
      { factor: "Pattern", is_problem: "", is_not_problem: "" },
    ],
    estimated_cost: 0,
    cost_currency: "EUR",
    customer_impact: "No",
    additional_notes: "",
  });

  const update4W2H = (field: keyof FourW2H, value: string) =>
    setData({ ...data, four_w_2h: { ...data.four_w_2h, [field]: value } });

  const updateFactor = (
    index: number,
    field: keyof IsIsNotFactor,
    value: string,
  ) => {
    const updated = [...data.is_is_not_factors];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, is_is_not_factors: updated });
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>⏳ Loading...</div>
    );
  }

  const submit = async () => {
    const freshValidation = await handleSubmit();
    onRefreshSteps();
    onValidationUpdate(freshValidation);
  };

  if (validating) {
    return <ValidationSpinner stepCode="D2" />;
  }

  return (
    <StepLayout
      meta={meta}
      onSaveDraft={handleSaveDraft}
      onSubmit={submit}
      saving={saving || validating}
    >
      {/* ── Section 1: 4W2H ──────────────────────────────────────────────── */}
      <div className="section">
        <h3>Problem Description (4W2H)</h3>

        <div className="field mb-4">
          <label className="font-semibold text-gray-700">
            I. Describe the object/process — defect or deviation from the
            reference standard or expected situation.
          </label>
          <textarea
            value={data.problem_description}
            onChange={(e) =>
              setData({ ...data, problem_description: e.target.value })
            }
            placeholder="What happened? Why is it a problem? When, where and by whom was it detected? How was it detected and how many parts are affected? What is the quantified impact (cost)?"
            className="w-full font-medium"
            rows={3}
          />
        </div>

        <div className="appGrid grid-cols-2 gap-4">
          <div className="field">
            <label className="flex items-center gap-2">
              <span className="text-red-600">❓</span>
              <span className="font-bold">WHAT</span> - What defect?
            </label>
            <input
              value={data.four_w_2h.what}
              onChange={(e) => update4W2H("what", e.target.value)}
              placeholder="Ex: post-weld crack, visual defect..."
              className="font-medium"
            />
          </div>

          <div className="field">
            <label className="flex items-center gap-2">
              <span className="text-blue-600">📍</span>
              <span className="font-bold">WHERE</span> - Where?
            </label>
            <input
              value={data.four_w_2h.where}
              onChange={(e) => update4W2H("where", e.target.value)}
              placeholder="Ex: Site A • Line 2 • Welding"
              className="font-medium"
            />
          </div>

          <div className="field">
            <label className="flex items-center gap-2">
              <span className="text-purple-600">📅</span>
              <span className="font-bold">WHEN</span> - When?
            </label>
            <input
              type="date"
              value={data.four_w_2h.when}
              onChange={(e) => update4W2H("when", e.target.value)}
              className="font-medium"
            />
          </div>

          <div className="field">
            <label className="flex items-center gap-2">
              <span className="text-green-600">👤</span>
              <span className="font-bold">WHO</span> - Who detected?
            </label>
            <input
              value={data.four_w_2h.who}
              onChange={(e) => update4W2H("who", e.target.value)}
              placeholder="Ex: Final inspection, Line 3 operator..."
              className="font-medium"
            />
          </div>

          <div className="field">
            <label className="flex items-center gap-2">
              <span className="text-amber-600">🔍</span>
              <span className="font-bold">HOW</span> - How detected?
            </label>
            <input
              value={data.four_w_2h.how}
              onChange={(e) => update4W2H("how", e.target.value)}
              placeholder="Ex: Visual + gauge, Optical scanner..."
              className="font-medium"
            />
          </div>

          <div className="field">
            <label className="flex items-center gap-2">
              <span className="text-rose-600">🔢</span>
              <span className="font-bold">HOW MANY</span> - Quantity?
            </label>
            <input
              value={data.four_w_2h.how_many}
              onChange={(e) => update4W2H("how_many", e.target.value)}
              placeholder="Ex: 15 pieces, 2 lots, 3%"
              className="font-medium"
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Deviation vs Standard ─────────────────────────────── */}
      <div className="section">
        <h3>Deviation vs Standard</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label className="flex items-center gap-2">
                <span className="text-indigo-600">📋</span>
                Applicable Standard
              </label>
              <input
                value={data.standard_applicable}
                onChange={(e) =>
                  setData({ ...data, standard_applicable: e.target.value })
                }
                placeholder="Ex: WI-WELD-02, ISO-9001-2015..."
                className="font-medium bg-indigo-50 border-indigo-200"
              />
            </div>

            <div className="field">
              <label className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Expected Situation
              </label>
              <input
                value={data.expected_situation}
                onChange={(e) =>
                  setData({ ...data, expected_situation: e.target.value })
                }
                placeholder="Ex: 0 crack allowed, tolerance ±0.1mm"
                className="font-medium bg-green-50 border-green-200"
              />
            </div>
          </div>

          <div className="field">
            <label className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              Observed Situation (Measured deviation)
            </label>
            <textarea
              value={data.observed_situation}
              onChange={(e) =>
                setData({ ...data, observed_situation: e.target.value })
              }
              placeholder="Precisely describe the observed deviation: dimensions, frequency, affected lots..."
              className="font-medium bg-red-50 border-red-200"
              rows={4}
            />
          </div>

          {/* ── Evidence Uploader (replaces plain text input) ── */}
          <div className="field">
            <label className="flex items-center gap-2 mb-2">
              <span className="text-blue-600">📎</span>
              <span>Evidence &amp; Documents</span>
              <span
                style={{
                  padding: "2px 8px",
                  background: "rgba(74,124,255,0.1)",
                  border: "1px solid rgba(74,124,255,0.3)",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#4A7CFF",
                  marginLeft: 4,
                }}
              >
                Files
              </span>
            </label>
            <EvidenceUploader
              stepId={stepId}
              onChange={(uploadedFiles) => {
                // Keep evidence_documents in sync with uploaded filenames
                // so the AI validator can reference them in its assessment
                const names = uploadedFiles.map((f) => f.filename).join(", ");
                setData((prev: D2FormData) => ({
                  ...prev,
                  evidence_documents: names,
                }));
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: IS / IS NOT ────────────────────────────────────────── */}
      <div className="section">
        <h3>II. Factor Analysis - IS / IS NOT</h3>
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              Identify what IS affected vs what IS NOT to isolate critical
              factors
            </span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="min-w-[120px] bg-gray-100">Factor</th>
                <th className="min-w-[250px] bg-green-50">Is a Problem</th>
                <th className="min-w-[250px] bg-red-50">Is Not a Problem</th>
              </tr>
            </thead>
            <tbody>
              {data.is_is_not_factors.map((factor, index) => (
                <tr key={index}>
                  <td className="font-semibold bg-gray-50">{factor.factor}</td>
                  <td className="bg-green-50/30">
                    <input
                      value={factor.is_problem}
                      onChange={(e) =>
                        updateFactor(index, "is_problem", e.target.value)
                      }
                      placeholder={`What ${factor.factor.toLowerCase()} is affected...`}
                      className="w-full font-medium"
                    />
                  </td>
                  <td className="bg-red-50/30">
                    <input
                      value={factor.is_not_problem}
                      onChange={(e) =>
                        updateFactor(index, "is_not_problem", e.target.value)
                      }
                      placeholder={`What ${factor.factor.toLowerCase()} is NOT affected...`}
                      className="w-full font-medium"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 4: Impact & Evidence ─────────────────────────────────── */}
      {/* <div className="section">
        <h3>Impact &amp; Evidence</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="field">
            <label className="flex items-center gap-2">
              <span className="text-amber-600">💵</span>
              Estimated Cost
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={data.estimated_cost}
                onChange={(e) =>
                  setData({
                    ...data,
                    estimated_cost: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="font-bold text-xl"
              />
              <select
                value={data.cost_currency}
                onChange={(e) =>
                  setData({ ...data, cost_currency: e.target.value })
                }
                className="w-24"
              >
                <option>EUR</option>
                <option>USD</option>
                <option>CNY</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              Customer Impact
            </label>
            <select
              value={data.customer_impact}
              onChange={(e) =>
                setData({ ...data, customer_impact: e.target.value })
              }
              className="font-bold text-lg"
            >
              <option value="No">✅ None</option>
              <option value="Low">⚠️ Low</option>
              <option value="Medium">🔶 Medium</option>
              <option value="High">🔴 High</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label className="flex items-center gap-2">
            <span>📝</span>
            Additional Notes
          </label>
          <textarea
            value={data.additional_notes}
            onChange={(e) =>
              setData({ ...data, additional_notes: e.target.value })
            }
            placeholder="Additional information, context, special observations..."
            className="w-full"
            rows={3}
          />
        </div>
      </div> */}
    </StepLayout>
  );
}
