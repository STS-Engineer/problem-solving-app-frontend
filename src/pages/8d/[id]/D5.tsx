// src/pages/8d/[id]/D5.tsx
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
interface CorrectiveActionD5 {
  action: string;
  responsible: string;
  due_date: string;
}
interface D5FormData {
  corrective_actions_occurrence: CorrectiveActionD5[];
  corrective_actions_detection: CorrectiveActionD5[];
}
interface D5Props {
  onRefreshSteps: () => void;
  onValidationUpdate: (validation: ValidationResult | null) => void;
}

// ── Sections ──────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 1,
    key: "corrective_occurrence",
    title: "Occurrence Actions",
    icon: "🔴",
  },
  {
    id: 2,
    key: "corrective_detection",
    title: "Detection Actions",
    icon: "🔍",
  },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];
type SectionStatus = "idle" | "validating" | "passed" | "failed";

const emptyAction: CorrectiveActionD5 = {
  action: "",
  responsible: "",
  due_date: "",
};

// ── Local pre-validation ──────────────────────────────────────────────────────
function localValidate(sectionKey: SectionKey, data: D5FormData): string[] {
  const errors: string[] = [];
  const actions =
    sectionKey === "corrective_occurrence"
      ? data.corrective_actions_occurrence
      : data.corrective_actions_detection;

  const filled = actions.filter(
    (a) => a.action.trim() && a.responsible.trim() && a.due_date,
  );
  if (filled.length === 0) {
    const label =
      sectionKey === "corrective_occurrence" ? "Occurrence" : "Detection";
    errors.push(
      `At least one complete ${label} action (action + responsible + due date) is required`,
    );
  }
  return errors;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function D5({ onRefreshSteps, onValidationUpdate }: D5Props) {
  const meta = STEPS.find((s) => s.code === "D5")!;
  const navigate = useNavigate();
  const { complaintId } = useParams<{ complaintId: string }>();

  const [currentSection, setCurrentSection] = useState(1);
  const [sectionStatus, setSectionStatus] = useState<
    Record<SectionKey, SectionStatus>
  >({
    corrective_occurrence: "idle",
    corrective_detection: "idle",
  });
  const [sectionValidations, setSectionValidations] = useState<
    Record<SectionKey, SectionValidationResult | null>
  >({ corrective_occurrence: null, corrective_detection: null });
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [isSectionValidating, setIsSectionValidating] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { loading, saving, stepId, data, setData, handleSaveDraft } =
    useStepData<D5FormData>("D5", {
      corrective_actions_occurrence: [
        { ...emptyAction },
        { ...emptyAction },
        { ...emptyAction },
      ],
      corrective_actions_detection: [
        { ...emptyAction },
        { ...emptyAction },
        { ...emptyAction },
      ],
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
          const idx = STEPS.findIndex((s) => s.code === "D5");
          const next = STEPS[idx + 1];
          if (next) navigate(`/8d/${complaintId}/${next.code}`);
          return null;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [allPassed]);

  const getSectionKey = (id: number): SectionKey =>
    SECTIONS.find((s) => s.id === id)!.key;

  // ── Action helpers ────────────────────────────────────────────────────────
  const updateOcc = (
    i: number,
    field: keyof CorrectiveActionD5,
    value: string,
  ) => {
    const updated = [...data.corrective_actions_occurrence];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, corrective_actions_occurrence: updated });
  };
  const updateDet = (
    i: number,
    field: keyof CorrectiveActionD5,
    value: string,
  ) => {
    const updated = [...data.corrective_actions_detection];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, corrective_actions_detection: updated });
  };
  const addOcc = () =>
    setData({
      ...data,
      corrective_actions_occurrence: [
        ...data.corrective_actions_occurrence,
        { ...emptyAction },
      ],
    });
  const addDet = () =>
    setData({
      ...data,
      corrective_actions_detection: [
        ...data.corrective_actions_detection,
        { ...emptyAction },
      ],
    });
  const removeOcc = (i: number) => {
    if (data.corrective_actions_occurrence.length <= 1) return;
    setData({
      ...data,
      corrective_actions_occurrence: data.corrective_actions_occurrence.filter(
        (_, idx) => idx !== i,
      ),
    });
  };
  const removeDet = (i: number) => {
    if (data.corrective_actions_detection.length <= 1) return;
    setData({
      ...data,
      corrective_actions_detection: data.corrective_actions_detection.filter(
        (_, idx) => idx !== i,
      ),
    });
  };

  // ── Per-section submit ─────────────────────────────────────────────────────
  const handleSectionSubmit = async (sectionId: number) => {
    const sectionKey = getSectionKey(sectionId);
    const errors = localValidate(sectionKey, data);
    if (errors.length > 0) {
      setLocalErrors(errors);
      return;
    }
    setLocalErrors([]);

    // Filter empty rows before saving
    const cleanData = {
      ...data,
      corrective_actions_occurrence: data.corrective_actions_occurrence.filter(
        (a) => a.action.trim() || a.responsible.trim() || a.due_date,
      ),
      corrective_actions_detection: data.corrective_actions_detection.filter(
        (a) => a.action.trim() || a.responsible.trim() || a.due_date,
      ),
    };
    if (stepId) await saveStepProgress(stepId, cleanData);

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
          setAllPassed(true);
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

  // ── Reusable action table ──────────────────────────────────────────────────
  const ActionTable = ({
    rows,
    onUpdate,
    onAdd,
    onRemove,
    headerLabel,
    accentColor,
  }: {
    rows: CorrectiveActionD5[];
    onUpdate: (
      i: number,
      field: keyof CorrectiveActionD5,
      value: string,
    ) => void;
    onAdd: () => void;
    onRemove: (i: number) => void;
    headerLabel: string;
    accentColor: string;
  }) => (
    <>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th
                className="min-w-[300px]"
                style={{ background: `${accentColor}15` }}
              >
                {headerLabel}
              </th>
              <th className="min-w-[150px] bg-green-50">Responsible</th>
              <th className="min-w-[130px] bg-amber-50">Due Date</th>
              <th className="min-w-[60px]"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((action, i) => (
              <tr key={i}>
                <td style={{ background: `${accentColor}08` }}>
                  <input
                    placeholder="Corrective action description..."
                    className="w-full font-medium"
                    value={action.action}
                    onChange={(e) => onUpdate(i, "action", e.target.value)}
                  />
                </td>
                <td className="bg-green-50/30">
                  <input
                    placeholder="Name..."
                    className="w-full font-medium"
                    value={action.responsible}
                    onChange={(e) => onUpdate(i, "responsible", e.target.value)}
                  />
                </td>
                <td className="bg-amber-50/30">
                  <input
                    type="date"
                    className="w-full font-medium"
                    value={action.due_date}
                    onChange={(e) => onUpdate(i, "due_date", e.target.value)}
                  />
                </td>
                <td>
                  {rows.length > 1 && (
                    <button
                      onClick={() => onRemove(i)}
                      style={{
                        background: "#E74C3C",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 10px",
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
      <button
        onClick={onAdd}
        className="btn mt-3 text-sm hover:scale-105 transition-transform"
      >
        ➕ Add action
      </button>
    </>
  );

  return (
    <StepLayout
      meta={meta}
      onSaveDraft={handleSaveDraft}
      onSubmit={handleSaveDraft}
      saving={saving}
      hideFooter
    >
      {/* Spinner overlay */}
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
          <ValidationSpinner stepCode="D5" />
        </div>
      )}

      {/* All passed countdown */}
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
              D5 Fully Validated!
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
              Both corrective action plans have been validated.
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
              Redirecting to D6 in {countdown}s…
            </div>
          </div>
        </div>
      )}

      {/* Section tabs */}
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

      {/* Local errors */}
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
          <h3>Corrective Actions — OCCURRENCE</h3>
          <p className="text-sm text-gray-500 mb-4">
            Actions targeting the root cause of occurrence identified in D4.
          </p>
          <ActionTable
            rows={data.corrective_actions_occurrence}
            onUpdate={updateOcc}
            onAdd={addOcc}
            onRemove={removeOcc}
            headerLabel="Corrective Action for Occurrence"
            accentColor="#3b82f6"
          />
          <SectionFooter
            sectionKey="corrective_occurrence"
            status={sectionStatus.corrective_occurrence}
            isValidating={
              isSectionValidating &&
              activeSectionKey === "corrective_occurrence"
            }
            onSubmit={() => handleSectionSubmit(1)}
          />
        </div>
      )}

      {/* ══ SECTION 2 — DETECTION ════════════════════════════════════════════ */}
      {currentSection === 2 && (
        <div className="section">
          <h3>Corrective Actions — DETECTION</h3>
          <p className="text-sm text-gray-500 mb-4">
            Actions targeting the root cause of non-detection identified in D4.
          </p>
          <ActionTable
            rows={data.corrective_actions_detection}
            onUpdate={updateDet}
            onAdd={addDet}
            onRemove={removeDet}
            headerLabel="Corrective Action for Detection"
            accentColor="#f97316"
          />
          <SectionFooter
            sectionKey="corrective_detection"
            status={sectionStatus.corrective_detection}
            isValidating={
              isSectionValidating && activeSectionKey === "corrective_detection"
            }
            onSubmit={() => handleSectionSubmit(2)}
          />
        </div>
      )}
    </StepLayout>
  );
}

// ── Section footer ────────────────────────────────────────────────────────────
interface SectionFooterProps {
  sectionKey: SectionKey;
  status: SectionStatus;
  isValidating: boolean;
  onSubmit: () => void;
}
function SectionFooter({ status, isValidating, onSubmit }: SectionFooterProps) {
  const busy = isValidating;
  const bg = busy
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
          background: bg,
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
