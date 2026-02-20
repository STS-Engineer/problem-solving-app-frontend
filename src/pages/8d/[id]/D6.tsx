// src/pages/8d/[id]/D6.tsx
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
  getStepByComplaintCode,
} from "../../../services/api/reports";
import ValidationSpinner from "../../../components/ValidationSpinner";

// ── Types ─────────────────────────────────────────────────────────────────────
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
  audited_by: string;
  audit_date: string;
  num_shifts: number;
}
interface D6Props {
  onRefreshSteps: () => void;
  onValidationUpdate: (validation: ValidationResult | null) => void;
}

// ── Sections (now only 2) ─────────────────────────────────────────────────────
const SECTIONS = [
  { id: 1, key: "implementation", title: "Implementation", icon: "⚙️" },
  {
    id: 2,
    key: "monitoring_checklist",
    title: "Monitoring & Checklist",
    icon: "📊",
  },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];
type SectionStatus = "idle" | "validating" | "passed" | "failed";

// ── Default data ──────────────────────────────────────────────────────────────
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

const DEFAULT_MONITORING: ImplementationMonitoring = {
  monitoring_interval: "",
  pieces_produced: null,
  rejection_rate: null,
  shift_1_data: "",
  shift_2_data: "",
};

const DEFAULT_CHECKLIST: ChecklistItem[] = DEFAULT_QUESTIONS.map((q) => ({
  question: q,
  checked: false,
  shift_1: false,
  shift_2: false,
  shift_3: false,
}));

const DEFAULT_DATA: D6FormData = {
  corrective_actions_occurrence: [],
  corrective_actions_detection: [],
  monitoring: DEFAULT_MONITORING,
  checklist: DEFAULT_CHECKLIST,
  audited_by: "",
  audit_date: "",
  num_shifts: 3,
};

// ── Shift config ──────────────────────────────────────────────────────────────
const ALL_SHIFTS = [
  {
    key: "shift_1" as const,
    label: "Shift 1",
    bg: "bg-blue-50/30",
    headBg: "bg-blue-50",
  },
  {
    key: "shift_2" as const,
    label: "Shift 2",
    bg: "bg-green-50/30",
    headBg: "bg-green-50",
  },
  {
    key: "shift_3" as const,
    label: "Shift 3",
    bg: "bg-amber-50/30",
    headBg: "bg-amber-50",
  },
];

// ── Local pre-validation ──────────────────────────────────────────────────────
function localValidate(sectionKey: SectionKey, data: D6FormData): string[] {
  const errors: string[] = [];

  if (sectionKey === "implementation") {
    const hasImpl = (actions: CorrectiveActionImplementation[]) =>
      actions.some((a) => a.action.trim() && (a.imp_date || a.evidence.trim()));
    if (
      !hasImpl(data.corrective_actions_occurrence) &&
      !hasImpl(data.corrective_actions_detection)
    )
      errors.push(
        "At least one action needs an implementation date or evidence",
      );
  }

  if (sectionKey === "monitoring_checklist") {
    const m = data.monitoring;
    const hasSomething =
      m.monitoring_interval.trim() ||
      m.pieces_produced ||
      m.rejection_rate !== null;
    if (!hasSomething)
      errors.push(
        "Fill at least one monitoring field (interval, pieces, or rejection rate)",
      );

    const checklist = data.checklist?.length
      ? data.checklist
      : DEFAULT_CHECKLIST;
    const numShifts = data.num_shifts ?? 3;
    const activeShiftKeys = ALL_SHIFTS.slice(0, numShifts).map((s) => s.key);
    const verified = checklist.filter((i) =>
      activeShiftKeys.some((s) => i[s]),
    ).length;
    if (verified < Math.ceil(checklist.length * 0.5))
      errors.push(
        `Check at least ${Math.ceil(checklist.length * 0.5)} checklist items across any shift (currently ${verified})`,
      );
  }

  return errors;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function D6({ onRefreshSteps, onValidationUpdate }: D6Props) {
  const meta = STEPS.find((s) => s.code === "D6")!;
  const navigate = useNavigate();
  const { complaintId } = useParams<{ complaintId: string }>();

  const [currentSection, setCurrentSection] = useState(1);
  const [sectionStatus, setSectionStatus] = useState<
    Record<SectionKey, SectionStatus>
  >({
    implementation: "idle",
    monitoring_checklist: "idle",
  });
  const [sectionValidations, setSectionValidations] = useState<
    Record<SectionKey, SectionValidationResult | null>
  >({ implementation: null, monitoring_checklist: null });
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [isSectionValidating, setIsSectionValidating] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [d5Initialized, setD5Initialized] = useState(false);

  const { loading, saving, stepId, data, setData, handleSaveDraft } =
    useStepData<D6FormData>("D6", DEFAULT_DATA);

  // ── Init defaults if missing ───────────────────────────────────────────────
  useEffect(() => {
    if (!data) return;
    const patch: Partial<D6FormData> = {};
    if (!data.monitoring || typeof data.monitoring !== "object")
      patch.monitoring = DEFAULT_MONITORING;
    if (!data.checklist || data.checklist.length === 0)
      patch.checklist = DEFAULT_CHECKLIST;
    if (data.num_shifts === undefined || data.num_shifts === null)
      patch.num_shifts = 3;
    if (data.audited_by === undefined) patch.audited_by = "";
    if (data.audit_date === undefined) patch.audit_date = "";
    if (Object.keys(patch).length > 0) setData({ ...data, ...patch });
  }, []);

  // ── Pre-fill from D5 ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!complaintId || loading || d5Initialized) return;
    getStepByComplaintCode(Number(complaintId), "D5")
      .then((d5Step) => {
        if (!d5Step?.data) return;
        const d5 = d5Step.data;
        const hasD6 =
          data.corrective_actions_occurrence.length > 0 ||
          data.corrective_actions_detection.length > 0;
        const hasD5 =
          (d5.corrective_actions_occurrence?.length || 0) > 0 ||
          (d5.corrective_actions_detection?.length || 0) > 0;
        if (!hasD6 && hasD5) {
          setData((prev: D6FormData) => ({
            ...prev,
            corrective_actions_occurrence:
              d5.corrective_actions_occurrence?.map((a: any) => ({
                action: a.action || "",
                responsible: a.responsible || "",
                due_date: a.due_date || "",
                imp_date: "",
                evidence: "",
              })) || [],
            corrective_actions_detection:
              d5.corrective_actions_detection?.map((a: any) => ({
                action: a.action || "",
                responsible: a.responsible || "",
                due_date: a.due_date || "",
                imp_date: "",
                evidence: "",
              })) || [],
          }));
          setD5Initialized(true);
        }
      })
      .catch(() => {});
  }, [complaintId, loading]);

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

  // ── Countdown navigation ───────────────────────────────────────────────────
  useEffect(() => {
    if (!allPassed) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          clearInterval(interval);
          const idx = STEPS.findIndex((s) => s.code === "D6");
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

  // ── Sanitize numeric fields before sending to backend ─────────────────────
  // Pydantic rejects "" for int/float fields — coerce to null
  const sanitizeForSave = (d: D6FormData): D6FormData => ({
    ...d,
    monitoring: d.monitoring
      ? {
          ...d.monitoring,
          pieces_produced:
            d.monitoring.pieces_produced === (null as any) ||
            d.monitoring.pieces_produced === ("" as any) ||
            d.monitoring.pieces_produced === undefined
              ? null
              : Number(d.monitoring.pieces_produced),
          rejection_rate:
            d.monitoring.rejection_rate === (null as any) ||
            d.monitoring.rejection_rate === ("" as any) ||
            d.monitoring.rejection_rate === undefined
              ? null
              : Number(d.monitoring.rejection_rate),
        }
      : d.monitoring,
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

    if (stepId) await saveStepProgress(stepId, sanitizeForSave(data));

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

  // ── Update helpers ─────────────────────────────────────────────────────────
  const updateOcc = (
    i: number,
    field: keyof CorrectiveActionImplementation,
    value: string,
  ) => {
    const updated = [...data.corrective_actions_occurrence];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, corrective_actions_occurrence: updated });
  };
  const updateDet = (
    i: number,
    field: keyof CorrectiveActionImplementation,
    value: string,
  ) => {
    const updated = [...data.corrective_actions_detection];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, corrective_actions_detection: updated });
  };
  const updateMonitoring = (
    field: keyof ImplementationMonitoring,
    value: any,
  ) =>
    setData({
      ...data,
      monitoring: {
        ...(data.monitoring || DEFAULT_MONITORING),
        [field]: value,
      },
    });
  const updateChecklist = (
    i: number,
    field: keyof ChecklistItem,
    value: boolean,
  ) => {
    const list = data.checklist?.length
      ? [...data.checklist]
      : [...DEFAULT_CHECKLIST];
    list[i] = { ...list[i], [field]: value };
    setData({ ...data, checklist: list });
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
  const checklist = data.checklist?.length ? data.checklist : DEFAULT_CHECKLIST;
  const numShifts = data.num_shifts ?? 3;
  const activeShifts = ALL_SHIFTS.slice(0, numShifts);

  const handleSaveDraftSanitized = () => {
    setData(sanitizeForSave(data));
    handleSaveDraft();
  };

  return (
    <StepLayout
      meta={meta}
      onSaveDraft={handleSaveDraftSanitized}
      onSubmit={handleSaveDraftSanitized}
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
          <ValidationSpinner stepCode="D6" />
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
              D6 Fully Validated!
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
              Implementation, monitoring, and checklist all confirmed.
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
              Redirecting to D7 in {countdown}s…
            </div>
          </div>
        </div>
      )}

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

      {/* ══ SECTION 1 — IMPLEMENTATION ══════════════════════════════════════ */}
      {currentSection === 1 && (
        <div className="section">
          <h3>I. Implementation of Corrective Actions</h3>
          <p className="text-sm text-gray-500 mb-4">
            Actions carried over from D5 — add implementation date and evidence
            for each.
          </p>

          {data.corrective_actions_occurrence.length === 0 &&
          data.corrective_actions_detection.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                ⚠️ No corrective actions found from D5. Please complete D5
                first.
              </p>
            </div>
          ) : (
            <>
              {data.corrective_actions_occurrence.length > 0 && (
                <>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Occurrence Actions
                  </h4>
                  <div className="overflow-x-auto mb-6">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th className="min-w-[220px] bg-blue-50">Action</th>
                          <th className="min-w-[130px] bg-green-50">
                            Responsible
                          </th>
                          <th className="min-w-[110px] bg-amber-50">
                            Due Date
                          </th>
                          <th className="min-w-[110px] bg-purple-50">
                            Imp. Date
                          </th>
                          <th className="min-w-[180px] bg-indigo-50">
                            Evidence
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.corrective_actions_occurrence.map((a, i) => (
                          <tr key={i}>
                            <td className="bg-blue-50/30">
                              <div className="font-medium text-gray-700 p-1">
                                {a.action || "—"}
                              </div>
                            </td>
                            <td className="bg-green-50/30">
                              <div className="font-medium text-gray-700 p-1">
                                {a.responsible || "—"}
                              </div>
                            </td>
                            <td className="bg-amber-50/30">
                              <div className="font-medium text-gray-700 p-1">
                                {a.due_date || "—"}
                              </div>
                            </td>
                            <td className="bg-purple-50/30">
                              <input
                                type="date"
                                className="w-full font-medium"
                                value={a.imp_date}
                                onChange={(e) =>
                                  updateOcc(i, "imp_date", e.target.value)
                                }
                              />
                            </td>
                            <td className="bg-indigo-50/30">
                              <input
                                placeholder="File/reference..."
                                className="w-full font-medium"
                                value={a.evidence}
                                onChange={(e) =>
                                  updateOcc(i, "evidence", e.target.value)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {data.corrective_actions_detection.length > 0 && (
                <>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Detection Actions
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th className="min-w-[220px] bg-orange-50">Action</th>
                          <th className="min-w-[130px] bg-green-50">
                            Responsible
                          </th>
                          <th className="min-w-[110px] bg-amber-50">
                            Due Date
                          </th>
                          <th className="min-w-[110px] bg-purple-50">
                            Imp. Date
                          </th>
                          <th className="min-w-[180px] bg-indigo-50">
                            Evidence
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.corrective_actions_detection.map((a, i) => (
                          <tr key={i}>
                            <td className="bg-orange-50/30">
                              <div className="font-medium text-gray-700 p-1">
                                {a.action || "—"}
                              </div>
                            </td>
                            <td className="bg-green-50/30">
                              <div className="font-medium text-gray-700 p-1">
                                {a.responsible || "—"}
                              </div>
                            </td>
                            <td className="bg-amber-50/30">
                              <div className="font-medium text-gray-700 p-1">
                                {a.due_date || "—"}
                              </div>
                            </td>
                            <td className="bg-purple-50/30">
                              <input
                                type="date"
                                className="w-full font-medium"
                                value={a.imp_date}
                                onChange={(e) =>
                                  updateDet(i, "imp_date", e.target.value)
                                }
                              />
                            </td>
                            <td className="bg-indigo-50/30">
                              <input
                                placeholder="File/reference..."
                                className="w-full font-medium"
                                value={a.evidence}
                                onChange={(e) =>
                                  updateDet(i, "evidence", e.target.value)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          <SectionFooter
            sectionKey="implementation"
            status={sectionStatus.implementation}
            isValidating={
              isSectionValidating && activeSectionKey === "implementation"
            }
            onSubmit={() => handleSectionSubmit(1)}
          />
        </div>
      )}

      {/* ══ SECTION 2 — MONITORING & CHECKLIST ══════════════════════════════ */}
      {currentSection === 2 && (
        <div className="section">
          {/* ── Part A: Monitoring ─────────────────────────────────────────── */}
          <h3>II. Monitoring & Effectiveness Check</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="field">
              <label className="text-sm font-medium">Monitoring interval</label>
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
              <label className="text-sm font-medium">Pieces produced</label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="field">
              <label className="text-sm font-medium">Shift 1 data</label>
              <input
                type="text"
                placeholder="Data..."
                className="w-full"
                value={data.monitoring?.shift_1_data ?? ""}
                onChange={(e) =>
                  updateMonitoring("shift_1_data", e.target.value)
                }
              />
            </div>
            <div className="field">
              <label className="text-sm font-medium">Shift 2 data</label>
              <input
                type="text"
                placeholder="Data..."
                className="w-full"
                value={data.monitoring?.shift_2_data ?? ""}
                onChange={(e) =>
                  updateMonitoring("shift_2_data", e.target.value)
                }
              />
            </div>
          </div>

          {/* ── Visual divider between parts ──────────────────────────────── */}
          <div
            style={{ borderTop: "2px dashed #e2e8f0", margin: "0 0 28px" }}
          />

          {/* ── Part B: Checklist ──────────────────────────────────────────── */}
          <h3>III. Implementation Checklist</h3>

          {/* Audit info + shift count */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="field">
              <label className="text-sm font-medium text-gray-700">
                Audited by
              </label>
              <input
                type="text"
                placeholder="Name and title..."
                className="w-full font-medium"
                value={data.audited_by ?? ""}
                onChange={(e) =>
                  setData({ ...data, audited_by: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label className="text-sm font-medium text-gray-700">
                Audit Date
              </label>
              <input
                type="date"
                className="w-full font-medium"
                value={data.audit_date ?? ""}
                onChange={(e) =>
                  setData({ ...data, audit_date: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label className="text-sm font-medium text-gray-700">
                Number of shifts in your plant
              </label>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setData({ ...data, num_shifts: n })}
                    style={{
                      flex: 1,
                      padding: "9px 0",
                      borderRadius: 8,
                      border: `2px solid ${numShifts === n ? "#4A7CFF" : "#e2e8f0"}`,
                      background:
                        numShifts === n
                          ? "linear-gradient(135deg, #4A7CFF 0%, #6C63FF 100%)"
                          : "white",
                      color: numShifts === n ? "white" : "#475569",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Only {numShifts} shift column{numShifts > 1 ? "s" : ""} will
                appear below.
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {(() => {
            const verified = checklist.filter((i) =>
              activeShifts.some((s) => i[s.key]),
            ).length;
            const pct = Math.round((verified / checklist.length) * 100);
            return (
              <div
                style={{
                  marginBottom: 20,
                  padding: "12px 16px",
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                  >
                    Completion: {verified}/{checklist.length} items
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: pct >= 50 ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: "#e5e7eb",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background:
                        pct >= 50
                          ? "linear-gradient(90deg, #22c55e, #16a34a)"
                          : "linear-gradient(90deg, #f97316, #ef4444)",
                      borderRadius: 4,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  Minimum 50% required to validate
                </div>
              </div>
            );
          })()}

          {/* Checklist table — dynamic shift columns */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[400px] bg-gray-50">Question</th>
                  {activeShifts.map((s) => (
                    <th
                      key={s.key}
                      className={`min-w-[90px] ${s.headBg} text-center`}
                    >
                      {s.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {checklist.map((item, idx) => {
                  const rowChecked = activeShifts.some((s) => item[s.key]);
                  return (
                    <tr
                      key={idx}
                      style={{
                        background: rowChecked
                          ? "rgba(34,197,94,0.04)"
                          : undefined,
                      }}
                    >
                      <td className="bg-gray-50/30">
                        <span className="font-medium text-gray-800">
                          {item.question}
                        </span>
                      </td>
                      {activeShifts.map((s) => (
                        <td
                          key={s.key}
                          className={s.bg}
                          style={{ textAlign: "center" }}
                        >
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-2"
                            checked={item[s.key]}
                            onChange={(e) =>
                              updateChecklist(idx, s.key, e.target.checked)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <SectionFooter
            sectionKey="monitoring_checklist"
            status={sectionStatus.monitoring_checklist}
            isValidating={
              isSectionValidating && activeSectionKey === "monitoring_checklist"
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
