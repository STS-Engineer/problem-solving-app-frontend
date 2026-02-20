// src/pages/8d/[id]/D4.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { useStepData } from "../../../hooks/useStepData";
import {
  ValidationResult,
  SectionValidationResult,
  saveStepProgress,
  submitSection,
  getSectionValidations,
} from "../../../services/api/reports";
import ValidationSpinner from "../../../components/ValidationSpinner";

// ── Types ─────────────────────────────────────────────────────────────────────
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
interface D4Props {
  onRefreshSteps: () => void;
  onValidationUpdate: (validation: ValidationResult | null) => void;
}

// ── Sections ──────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 1, key: "four_m_occurrence", title: "Occurrence", icon: "🔴" },
  { id: 2, key: "four_m_non_detection", title: "Non-Detection", icon: "🔍" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];
type SectionStatus = "idle" | "validating" | "passed" | "failed";

// ── Defaults ──────────────────────────────────────────────────────────────────
const emptyRow: FourMRow = {
  material: "",
  method: "",
  machine: "",
  manpower: "",
  environment: "",
};
const emptyFourM: FourMEnvironment = {
  row_1: { ...emptyRow },
  row_2: { ...emptyRow },
  row_3: { ...emptyRow },
  selected_problem: "",
};
const emptyWhy: FiveWhyItem = { question: "", answer: "" };
const emptyFiveWhys: FiveWhys = {
  why_1: { ...emptyWhy },
  why_2: { ...emptyWhy },
  why_3: { ...emptyWhy },
  why_4: { ...emptyWhy },
  why_5: { ...emptyWhy },
};
const emptyRC: RootCauseConclusion = { root_cause: "", validation_method: "" };

// ── Local pre-validation ──────────────────────────────────────────────────────
function localValidate(sectionKey: SectionKey, data: D4FormData): string[] {
  const errors: string[] = [];
  if (sectionKey === "four_m_occurrence") {
    const fourM = data.four_m_occurrence;
    const anyFourM = ["row_1", "row_2", "row_3"].some((r) =>
      Object.values(fourM[r as keyof typeof fourM] as FourMRow).some((v) =>
        v.trim(),
      ),
    );
    if (!anyFourM) errors.push("Fill at least one 4M row for Occurrence");
    if (!fourM.selected_problem.trim())
      errors.push("Select the root cause problem for Occurrence");
    const anyWhy = Object.values(data.five_whys_occurrence).some((w) =>
      (w as FiveWhyItem).answer.trim(),
    );
    if (!anyWhy) errors.push("Fill at least Why 1 answer for Occurrence");
    if (!data.root_cause_occurrence.root_cause.trim())
      errors.push("Root cause conclusion for Occurrence is required");
    if (!data.root_cause_occurrence.validation_method.trim())
      errors.push("Validation method for Occurrence root cause is required");
  }
  if (sectionKey === "four_m_non_detection") {
    const fourM = data.four_m_non_detection;
    const anyFourM = ["row_1", "row_2", "row_3"].some((r) =>
      Object.values(fourM[r as keyof typeof fourM] as FourMRow).some((v) =>
        v.trim(),
      ),
    );
    if (!anyFourM) errors.push("Fill at least one 4M row for Non-Detection");
    if (!fourM.selected_problem.trim())
      errors.push("Select the root cause problem for Non-Detection");
    const anyWhy = Object.values(data.five_whys_non_detection).some((w) =>
      (w as FiveWhyItem).answer.trim(),
    );
    if (!anyWhy) errors.push("Fill at least Why 1 answer for Non-Detection");
    if (!data.root_cause_non_detection.root_cause.trim())
      errors.push("Root cause conclusion for Non-Detection is required");
    if (!data.root_cause_non_detection.validation_method.trim())
      errors.push("Validation method for Non-Detection root cause is required");
  }
  return errors;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function D4({ onRefreshSteps, onValidationUpdate }: D4Props) {
  const meta = STEPS.find((s) => s.code === "D4")!;
  const navigate = useNavigate();
  const { complaintId } = useParams<{ complaintId: string }>();

  const [currentSection, setCurrentSection] = useState(1);
  const [sectionStatus, setSectionStatus] = useState<
    Record<SectionKey, SectionStatus>
  >({
    four_m_occurrence: "idle",
    four_m_non_detection: "idle",
  });
  const [sectionValidations, setSectionValidations] = useState<
    Record<SectionKey, SectionValidationResult | null>
  >({ four_m_occurrence: null, four_m_non_detection: null });
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [isSectionValidating, setIsSectionValidating] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { loading, saving, stepId, data, setData, handleSaveDraft } =
    useStepData<D4FormData>("D4", {
      four_m_occurrence: { ...emptyFourM },
      five_whys_occurrence: { ...emptyFiveWhys },
      root_cause_occurrence: { ...emptyRC },
      four_m_non_detection: { ...emptyFourM },
      five_whys_non_detection: { ...emptyFiveWhys },
      root_cause_non_detection: { ...emptyRC },
    });

  // ── Restore on mount ────────────────────────────────────────────────────────
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
        const firstPending = SECTIONS.find(
          (s) => newStatus[s.key] !== "passed",
        );
        if (firstPending) setCurrentSection(firstPending.id);
      })
      .catch(() => {});
  }, [stepId]);

  // ── Sync ChatCoach on section switch ───────────────────────────────────────
  useEffect(() => {
    const key = SECTIONS.find((s) => s.id === currentSection)!.key;
    const stored = sectionValidations[key];
    if (!stored) {
      onValidationUpdate(null);
      return;
    }
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

  // ── 3-second countdown then navigate ──────────────────────────────────────
  useEffect(() => {
    if (!allPassed) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          clearInterval(interval);
          const d4Index = STEPS.findIndex((s) => s.code === "D4");
          const next = STEPS[d4Index + 1];
          if (next) navigate(`/8d/${complaintId}/${next.code}`);
          return null;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [allPassed]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getSectionKey = (id: number): SectionKey =>
    SECTIONS.find((s) => s.id === id)!.key;

  const updateOcc4M = (
    rowKey: "row_1" | "row_2" | "row_3",
    field: keyof FourMRow,
    value: string,
  ) =>
    setData({
      ...data,
      four_m_occurrence: {
        ...data.four_m_occurrence,
        [rowKey]: { ...data.four_m_occurrence[rowKey], [field]: value },
      },
    });

  const updateND4M = (
    rowKey: "row_1" | "row_2" | "row_3",
    field: keyof FourMRow,
    value: string,
  ) =>
    setData({
      ...data,
      four_m_non_detection: {
        ...data.four_m_non_detection,
        [rowKey]: { ...data.four_m_non_detection[rowKey], [field]: value },
      },
    });

  const updateOccWhy = (
    whyKey: keyof FiveWhys,
    field: "question" | "answer",
    value: string,
  ) =>
    setData({
      ...data,
      five_whys_occurrence: {
        ...data.five_whys_occurrence,
        [whyKey]: { ...data.five_whys_occurrence[whyKey], [field]: value },
      },
    });

  const updateNDWhy = (
    whyKey: keyof FiveWhys,
    field: "question" | "answer",
    value: string,
  ) =>
    setData({
      ...data,
      five_whys_non_detection: {
        ...data.five_whys_non_detection,
        [whyKey]: { ...data.five_whys_non_detection[whyKey], [field]: value },
      },
    });

  // ── Per-section submit ─────────────────────────────────────────────────────
  const handleSectionSubmit = async (sectionId: number) => {
    const sectionKey = getSectionKey(sectionId);
    const errors = localValidate(sectionKey, data);
    if (errors.length > 0) {
      setLocalErrors(errors);
      return;
    }
    setLocalErrors([]);

    if (stepId) await saveStepProgress(stepId, data);

    setIsSectionValidating(true);
    setSectionStatus((p) => ({ ...p, [sectionKey]: "validating" }));

    try {
      const result = await submitSection(stepId!, sectionKey);
      const v = result.validation;
      setSectionValidations((p) => ({ ...p, [sectionKey]: v as any }));

      if (v.decision === "pass") {
        setSectionStatus((p) => ({ ...p, [sectionKey]: "passed" }));
        if (result.all_sections_passed) {
          onRefreshSteps();
          onValidationUpdate(v);
          setAllPassed(true); // ← triggers countdown
        } else {
          const next = SECTIONS.find((s) =>
            result.remaining_sections.includes(s.key),
          );
          if (next) setTimeout(() => setCurrentSection(next.id), 700);
        }
      } else {
        setSectionStatus((p) => ({ ...p, [sectionKey]: "failed" }));
      }
    } catch {
      setSectionStatus((p) => ({ ...p, [sectionKey]: "failed" }));
    } finally {
      setIsSectionValidating(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>⏳ Loading...</div>
    );

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

  // ── 4M table renderer ──────────────────────────────────────────────────────
  const FourMTable = ({
    fourM,
    onUpdate,
    onProblemChange,
    accentColor,
  }: {
    fourM: FourMEnvironment;
    onUpdate: (
      row: "row_1" | "row_2" | "row_3",
      field: keyof FourMRow,
      value: string,
    ) => void;
    onProblemChange: (value: string) => void;
    accentColor: string;
  }) => (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th className="min-w-[140px] bg-blue-50">Material</th>
            <th className="min-w-[140px] bg-purple-50">Method</th>
            <th className="min-w-[140px] bg-orange-50">Machine</th>
            <th className="min-w-[140px] bg-green-50">Manpower</th>
            <th className="min-w-[140px] bg-indigo-50">Environment</th>
            <th className="min-w-[130px] bg-gray-100">Selected Problem</th>
          </tr>
        </thead>
        <tbody>
          {(["row_1", "row_2", "row_3"] as const).map((rowKey, idx) => (
            <tr key={rowKey}>
              {(
                [
                  "material",
                  "method",
                  "machine",
                  "manpower",
                  "environment",
                ] as const
              ).map((field, fi) => (
                <td
                  key={field}
                  className={
                    [
                      "bg-blue-50/30",
                      "bg-purple-50/30",
                      "bg-orange-50/30",
                      "bg-green-50/30",
                      "bg-indigo-50/30",
                    ][fi]
                  }
                >
                  <input
                    placeholder={`${["A", "E", "C", "N", "S"][fi]}${idx + 1}`}
                    className="w-full font-medium"
                    value={fourM[rowKey][field]}
                    onChange={(e) => onUpdate(rowKey, field, e.target.value)}
                  />
                </td>
              ))}
              {idx === 0 && (
                <td rowSpan={3} className="bg-gray-50">
                  <textarea
                    placeholder="Select the root cause..."
                    className="w-full h-full resize-none"
                    rows={5}
                    value={fourM.selected_problem}
                    onChange={(e) => onProblemChange(e.target.value)}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ── 5 Whys renderer ────────────────────────────────────────────────────────
  const FiveWhysBlock = ({
    whys,
    onUpdate,
    badgeColor,
  }: {
    whys: FiveWhys;
    onUpdate: (
      key: keyof FiveWhys,
      field: "question" | "answer",
      value: string,
    ) => void;
    badgeColor: string;
  }) => (
    <div className="space-y-3">
      {(["why_1", "why_2", "why_3", "why_4", "why_5"] as const).map(
        (key, idx) => (
          <div key={key} className="border rounded-lg p-4 bg-gray-50">
            <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span
                style={{ background: badgeColor }}
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-sm font-bold"
              >
                {idx + 1}
              </span>
              <span>Why {idx + 1}?</span>
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
                  value={whys[key].question}
                  onChange={(e) => onUpdate(key, "question", e.target.value)}
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
                  value={whys[key].answer}
                  onChange={(e) => onUpdate(key, "answer", e.target.value)}
                />
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );

  return (
    <StepLayout
      meta={meta}
      onSaveDraft={handleSaveDraft}
      onSubmit={handleSaveDraft}
      saving={saving}
      hideFooter
    >
      {/* Validation spinner overlay */}
      {isSectionValidating && (
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
          <ValidationSpinner stepCode="D4" />
        </div>
      )}

      {/* ── All passed banner + countdown ─────────────────────────────────── */}
      {allPassed && countdown !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "40px 56px",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              border: "3px solid #22c55e",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#15803d",
                marginBottom: 8,
              }}
            >
              D4 Fully Validated!
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
              Both root causes have been validated by the AI coach.
            </div>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                margin: "0 auto",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
                color: "white",
                boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
              }}
            >
              {countdown}
            </div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 12 }}>
              Redirecting to D5 in {countdown}s…
            </div>
          </div>
        </div>
      )}

      {/* ── Section tabs ──────────────────────────────────────────────────── */}
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

      {/* ══ SECTION 1 — OCCURRENCE ══════════════════════════════════════════ */}
      {currentSection === 1 && (
        <div className="section">
          <h3>Root Cause — OCCURRENCE</h3>

          <h4 className="font-semibold text-gray-700 mb-3">
            I. 4M + Environment — Potential root causes
          </h4>
          <FourMTable
            fourM={data.four_m_occurrence}
            onUpdate={updateOcc4M}
            onProblemChange={(v) =>
              setData({
                ...data,
                four_m_occurrence: {
                  ...data.four_m_occurrence,
                  selected_problem: v,
                },
              })
            }
            accentColor="#2563eb"
          />

          <h4 className="font-semibold text-gray-700 mt-6 mb-3">
            II. 5 Whys — Occurrence
          </h4>
          <FiveWhysBlock
            whys={data.five_whys_occurrence}
            onUpdate={updateOccWhy}
            badgeColor="#2563eb"
          />

          <h4 className="font-semibold text-gray-700 mt-6 mb-3">
            III. Root Cause Conclusion
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
              <label className="text-sm font-medium">
                How was it validated?
              </label>
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

          <SectionFooter
            sectionKey="four_m_occurrence"
            status={sectionStatus.four_m_occurrence}
            isValidating={
              isSectionValidating && activeSectionKey === "four_m_occurrence"
            }
            onSubmit={() => handleSectionSubmit(1)}
          />
        </div>
      )}

      {/* ══ SECTION 2 — NON-DETECTION ════════════════════════════════════════ */}
      {currentSection === 2 && (
        <div className="section">
          <h3>Root Cause — NON-DETECTION</h3>

          <h4 className="font-semibold text-gray-700 mb-3">
            IV. 4M + Environment — Potential root causes (Non-Detection)
          </h4>
          <FourMTable
            fourM={data.four_m_non_detection}
            onUpdate={updateND4M}
            onProblemChange={(v) =>
              setData({
                ...data,
                four_m_non_detection: {
                  ...data.four_m_non_detection,
                  selected_problem: v,
                },
              })
            }
            accentColor="#ea580c"
          />

          <h4 className="font-semibold text-gray-700 mt-6 mb-3">
            V. 5 Whys — Non-Detection
          </h4>
          <FiveWhysBlock
            whys={data.five_whys_non_detection}
            onUpdate={updateNDWhy}
            badgeColor="#ea580c"
          />

          <h4 className="font-semibold text-gray-700 mt-6 mb-3">
            VI. Root Cause Conclusion
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
              <label className="text-sm font-medium">
                How was it validated?
              </label>
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

          <SectionFooter
            sectionKey="four_m_non_detection"
            status={sectionStatus.four_m_non_detection}
            isValidating={
              isSectionValidating && activeSectionKey === "four_m_non_detection"
            }
            onSubmit={() => handleSectionSubmit(2)}
          />
        </div>
      )}
    </StepLayout>
  );
}

// ── Reusable section footer ───────────────────────────────────────────────────
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
  const label = busy
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
      {status === "passed" && !busy && (
        <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
          ✓ Section validated — you can still edit and re-validate
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
          opacity: busy ? 0.75 : 1,
        }}
      >
        {label}
      </button>
    </div>
  );
}
