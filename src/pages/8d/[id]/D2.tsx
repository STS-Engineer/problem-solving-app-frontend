// src/pages/8d/[id]/D2.tsx
import { useState, useEffect } from "react";
import { useStepData } from "../../../hooks/useStepData";
import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import {
  ValidationResult,
  SectionValidationResult,
  submitSection,
  getSectionValidations,
  saveStepProgress,
} from "../../../services/api/reports";
import ValidationSpinner from "../../../components/ValidationSpinner";
import EvidenceUploader from "../../../components/EvidenceUploader";

// ── Types ────────────────────────────────────────────────────────────────────
interface FiveW2H {
  what: string;
  where: string;
  when: string;
  who: string;
  how: string;
  how_many: string;
  why: string;
}
interface IsIsNotFactor {
  factor: string;
  is_problem: string;
  is_not_problem: string;
}
interface D2FormData {
  problem_description: string;
  five_w_2h: FiveW2H;
  standard_applicable: string;
  expected_situation: string;
  observed_situation: string;
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

// ── Section config ───────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 1, key: "five_w_2h", title: "5W2H Analysis", icon: "❓" },
  { id: 2, key: "deviation", title: "Deviation vs Standard", icon: "📋" },
  { id: 3, key: "is_is_not", title: "IS / IS NOT Analysis", icon: "🔍" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];
type SectionStatus = "idle" | "validating" | "passed" | "failed";

// ── Local pre-validation (prevents sending obviously empty data to AI) ────────
function localValidate(sectionKey: SectionKey, data: D2FormData): string[] {
  const errors: string[] = [];
  if (sectionKey === "five_w_2h") {
    if (!data.problem_description.trim())
      errors.push("Problem description is required");
    const w = data.five_w_2h;
    if (!w.what.trim()) errors.push("WHAT is required");
    if (!w.where.trim()) errors.push("WHERE is required");
    if (!w.when.trim()) errors.push("WHEN (date) is required");
    if (!w.who.trim()) errors.push("WHO is required");
    if (!w.why.trim()) errors.push("WHY is required");
    if (!w.how.trim()) errors.push("HOW is required");
    if (!w.how_many.trim()) errors.push("HOW MANY is required");
  }
  if (sectionKey === "deviation") {
    if (!data.standard_applicable.trim())
      errors.push("Applicable standard is required");
    if (!data.expected_situation.trim())
      errors.push("Expected situation is required");
    if (!data.observed_situation.trim())
      errors.push("Observed situation is required");
  }
  if (sectionKey === "is_is_not") {
    const filled = data.is_is_not_factors.filter(
      (f) => f.is_problem.trim() || f.is_not_problem.trim(),
    );
    if (filled.length < 2)
      errors.push("Fill at least 2 IS / IS NOT factor rows");
  }
  return errors;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function D2({ onRefreshSteps, onValidationUpdate }: D2Props) {
  const meta = STEPS.find((s) => s.code === "D2")!;

  const [currentSection, setCurrentSection] = useState<number>(1);
  const [sectionStatus, setSectionStatus] = useState<
    Record<SectionKey, SectionStatus>
  >({
    five_w_2h: "idle",
    deviation: "idle",
    is_is_not: "idle",
  });
  const [sectionValidations, setSectionValidations] = useState<
    Record<SectionKey, SectionValidationResult | null>
  >({ five_w_2h: null, deviation: null, is_is_not: null });
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [isSectionValidating, setIsSectionValidating] = useState(false);

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
    five_w_2h: {
      what: "",
      where: "",
      when: "",
      who: "",
      how: "",
      how_many: "",
      why: "",
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

  // ── Restore section statuses on mount ──────────────────────────────────────
  useEffect(() => {
    if (!stepId) return;
    getSectionValidations(stepId)
      .then((res) => {
        const newStatus = { ...sectionStatus };
        const newValidations = { ...sectionValidations };
        for (const key of Object.keys(res.sections) as SectionKey[]) {
          const sv = res.sections[key];
          newStatus[key] = sv.decision === "pass" ? "passed" : "failed";
          newValidations[key] = sv;
        }
        setSectionStatus(newStatus);
        setSectionValidations(newValidations);

        // Auto-navigate to first non-passed section
        const firstPending = SECTIONS.find(
          (s) => newStatus[s.key] !== "passed",
        );
        if (firstPending) setCurrentSection(firstPending.id);
      })
      .catch(() => {
        // No previous validations — start fresh
      });
  }, [stepId]);
  useEffect(() => {
    const key = getSectionKey(currentSection);
    const stored = sectionValidations[key];
    if (!stored) {
      onValidationUpdate(null);
      return;
    }
    // Normalize SectionValidationResult → ValidationResult
    onValidationUpdate({
      decision: stored.decision,
      missing_fields: stored.missing_fields ?? [],
      incomplete_fields: [],
      quality_issues: stored.quality_issues ?? [],
      rules_violations: [],
      suggestions: stored.suggestions ?? [],
      field_improvements: stored.field_improvements ?? {},
      overall_assessment: stored.overall_assessment ?? "",
      language_detected: "en",
    });
  }, [currentSection, sectionValidations]);
  const update5W2H = (field: keyof FiveW2H, value: string) =>
    setData({ ...data, five_w_2h: { ...data.five_w_2h, [field]: value } });

  const updateFactor = (
    index: number,
    field: keyof IsIsNotFactor,
    value: string,
  ) => {
    const updated = [...data.is_is_not_factors];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, is_is_not_factors: updated });
  };

  const getSectionKey = (id: number): SectionKey =>
    SECTIONS.find((s) => s.id === id)!.key;

  // ── Per-section: save → AI validate ────────────────────────────────────────
  const handleSectionSubmit = async (sectionId: number) => {
    const sectionKey = getSectionKey(sectionId);

    const errors = localValidate(sectionKey, data);
    if (errors.length > 0) {
      setLocalErrors(errors);
      return;
    }
    setLocalErrors([]);

    // Silent save — no toast
    if (stepId) {
      await saveStepProgress(stepId, data);
    }

    setIsSectionValidating(true);
    setSectionStatus((p) => ({ ...p, [sectionKey]: "validating" }));

    try {
      const result = await submitSection(stepId!, sectionKey);
      const v = result.validation;

      setSectionValidations((p) => ({ ...p, [sectionKey]: v as any }));
      // onValidationUpdate is now handled by the useEffect above ↑
      // so no need to call it here

      if (v.decision === "pass") {
        setSectionStatus((p) => ({ ...p, [sectionKey]: "passed" }));
        if (result.all_sections_passed) {
          onRefreshSteps();
          onValidationUpdate(v); // final pass — update coach with full result
        } else {
          const next = SECTIONS.find((s) =>
            result.remaining_sections.includes(s.key),
          );
          if (next) setTimeout(() => setCurrentSection(next.id), 700);
        }
      } else {
        setSectionStatus((p) => ({ ...p, [sectionKey]: "failed" }));
      }
    } catch (err) {
      setSectionStatus((p) => ({ ...p, [sectionKey]: "failed" }));
    } finally {
      setIsSectionValidating(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>⏳ Loading...</div>
    );
  if (validating) return <ValidationSpinner stepCode="D2" />;

  // Add inside <StepLayout> as first child:
  {
    isSectionValidating && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ValidationSpinner stepCode="D2" />
      </div>
    );
  }
  // ── Status helpers ──────────────────────────────────────────────────────────
  const STATUS_COLOR: Record<SectionStatus, string> = {
    idle: "#94a3b8",
    validating: "#f59e0b",
    passed: "#22c55e",
    failed: "#ef4444",
  };
  const STATUS_ICON: Record<SectionStatus, string> = {
    idle: "○",
    validating: "⏳",
    passed: "✅",
    failed: "❌",
  };

  const activeSectionKey = getSectionKey(currentSection);

  return (
    <StepLayout
      meta={meta}
      onSaveDraft={handleSaveDraft}
      onSubmit={handleSaveDraft} // footer submit = save draft; real submit is per-section
      saving={saving}
      hideFooter
    >
      {/* ── Section tabs ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 28,
          background: "#f8fafc",
          borderRadius: 12,
          padding: 6,
          border: "1px solid #e2e8f0",
        }}
      >
        {SECTIONS.map((s) => {
          const st = sectionStatus[s.key];
          const isActive = currentSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                setLocalErrors([]);
                setCurrentSection(s.id);
              }}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 8,
                border: "none",
                background: isActive
                  ? "linear-gradient(135deg, #4A7CFF 0%, #6C63FF 100%)"
                  : "transparent",
                color: isActive ? "white" : "#475569",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>{s.icon}</span>
                <span>{s.title}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 14 }}>{STATUS_ICON[st]}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: isActive
                      ? "rgba(255,255,255,0.75)"
                      : STATUS_COLOR[st],
                  }}
                >
                  {st === "idle"
                    ? "Not validated"
                    : st === "validating"
                      ? "Validating…"
                      : st === "passed"
                        ? "Passed"
                        : "Needs fixes"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Local error banner ────────────────────────────────────────────── */}
      {localErrors.length > 0 && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #fc8181",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: "#c53030", marginBottom: 4 }}>
              Fix before validating:
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {localErrors.map((e, i) => (
                <li key={i} style={{ fontSize: 13, color: "#c53030" }}>
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — 5W2H
      ══════════════════════════════════════════════════════════════════════ */}
      {currentSection === 1 && (
        <div className="section">
          <h3>Problem Description (5W2H)</h3>

          <div className="field mb-4">
            <label className="font-semibold text-gray-700">
              Describe the object/process — defect or deviation from the
              reference standard.
            </label>
            <textarea
              value={data.problem_description}
              onChange={(e) =>
                setData({ ...data, problem_description: e.target.value })
              }
              placeholder="Describe the object or process concerned. Explain the defect or deviation compared to the expected standard. State the quantified impact, including the cost."
              className="w-full font-medium"
              rows={3}
            />
          </div>

          <div className="appGrid grid-cols-2 gap-4">
            {(
              [
                {
                  key: "what",
                  icon: "❓",
                  color: "#dc2626",
                  label: "WHAT",
                  sub: "What defect?",
                  type: "text",
                  ph: "Ex: post-weld crack, visual defect...",
                },
                {
                  key: "where",
                  icon: "📍",
                  color: "#2563eb",
                  label: "WHERE",
                  sub: "Where?",
                  type: "text",
                  ph: "Ex: Site A • Line 2 • Welding",
                },
                {
                  key: "when",
                  icon: "📅",
                  color: "#7c3aed",
                  label: "WHEN",
                  sub: "When?",
                  type: "date",
                  ph: "",
                },
                {
                  key: "who",
                  icon: "👤",
                  color: "#16a34a",
                  label: "WHO",
                  sub: "Who detected?",
                  type: "text",
                  ph: "Ex: Final inspection, Line 3 operator...",
                },
                {
                  key: "why",
                  icon: "💡",
                  color: "#ea580c",
                  label: "WHY",
                  sub: "Why is it a problem?",
                  type: "text",
                  ph: "Ex: Safety risk, customer complaint...",
                },
                {
                  key: "how",
                  icon: "🔍",
                  color: "#d97706",
                  label: "HOW",
                  sub: "How detected?",
                  type: "text",
                  ph: "Ex: Visual + gauge, Optical scanner...",
                },
                {
                  key: "how_many",
                  icon: "🔢",
                  color: "#e11d48",
                  label: "HOW MANY",
                  sub: "Quantity?",
                  type: "text",
                  ph: "Ex: 15 pieces, 2 lots, 3%",
                },
              ] as const
            ).map(({ key, icon, color, label, sub, type, ph }) => (
              <div key={key} className="field">
                <label className="flex items-center gap-2">
                  <span style={{ color }}>{icon}</span>
                  <span className="font-bold">{label}</span>
                  <span className="text-gray-500 text-sm">— {sub}</span>
                </label>
                <input
                  type={type}
                  value={(data.five_w_2h as any)[key]}
                  onChange={(e) =>
                    update5W2H(key as keyof FiveW2H, e.target.value)
                  }
                  placeholder={ph}
                  className="font-medium"
                />
              </div>
            ))}
          </div>

          <SectionFooter
            sectionKey="five_w_2h"
            status={sectionStatus.five_w_2h}
            isValidating={
              isSectionValidating && activeSectionKey === "five_w_2h"
            }
            onSubmit={() => handleSectionSubmit(1)}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — Deviation vs Standard
      ══════════════════════════════════════════════════════════════════════ */}
      {currentSection === 2 && (
        <div className="section">
          <h3>Deviation vs Standard</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label className="flex items-center gap-2">
                <span className="text-indigo-600">📋</span> Applicable Standard
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
                <span className="text-green-600">✅</span> Expected Situation
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

          <div className="field mt-4">
            <label className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span> Observed Situation
              (Measured deviation)
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

          <div className="field mt-4">
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
                const names = uploadedFiles.map((f) => f.filename).join(", ");
                setData((prev: D2FormData) => ({
                  ...prev,
                  evidence_documents: names,
                }));
              }}
            />
          </div>

          <SectionFooter
            sectionKey="deviation"
            status={sectionStatus.deviation}
            isValidating={
              isSectionValidating && activeSectionKey === "deviation"
            }
            onSubmit={() => handleSectionSubmit(2)}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — IS / IS NOT
      ══════════════════════════════════════════════════════════════════════ */}
      {currentSection === 3 && (
        <div className="section">
          <h3>Factor Analysis — IS / IS NOT</h3>

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
                    <td className="font-semibold bg-gray-50">
                      {factor.factor}
                    </td>
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

          <SectionFooter
            sectionKey="is_is_not"
            status={sectionStatus.is_is_not}
            isValidating={
              isSectionValidating && activeSectionKey === "is_is_not"
            }
            onSubmit={() => handleSectionSubmit(3)}
          />
        </div>
      )}
    </StepLayout>
  );
}

// ── Reusable section footer ──────────────────────────────────────────────────
interface SectionFooterProps {
  sectionKey: SectionKey;
  status: SectionStatus;
  isValidating: boolean;
  onSubmit: () => void;
}

function SectionFooter({ status, isValidating, onSubmit }: SectionFooterProps) {
  const busy = isValidating;

  const bgColor = busy
    ? "#94a3b8"
    : status === "passed"
      ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
      : status === "failed"
        ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
        : "linear-gradient(135deg, #4A7CFF 0%, #6C63FF 100%)";

  const label = isValidating
    ? "⏳ AI is validating…"
    : status === "passed"
      ? "✅ Passed — re-validate"
      : status === "failed"
        ? "🔄 Fix & Re-validate"
        : "✅ Validate & Save Section";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        marginTop: 24,
        paddingTop: 20,
        borderTop: "1px solid #e2e8f0",
        gap: 12,
      }}
    >
      {status === "passed" && !isValidating && (
        <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
          ✓ This section is validated — you can still edit and re-validate
        </span>
      )}
      <button
        onClick={onSubmit}
        disabled={busy}
        style={{
          padding: "11px 28px",
          borderRadius: 8,
          border: "none",
          background: bgColor,
          color: "white",
          fontWeight: 700,
          fontSize: 14,
          cursor: busy ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: busy ? "none" : "0 4px 12px rgba(74,124,255,0.25)",
          transition: "all 0.2s",
          opacity: busy ? 0.75 : 1,
        }}
      >
        {label}
      </button>
    </div>
  );
}
