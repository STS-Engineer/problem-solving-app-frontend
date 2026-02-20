// src/pages/8d/[id]/D7.tsx
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
interface D7Props {
  onRefreshSteps: () => void;
  onValidationUpdate: (validation: ValidationResult | null) => void;
}

// ── Sections ──────────────────────────────────────────────────────────────────
// Section 1 — Prevention   : Risk of recurrence + Replication validation
// Section 2 — Knowledge    : Knowledge base updates + Long-term monitoring
// Section 3 — Lessons      : Dissemination + LL conclusion
const SECTIONS = [
  { id: 1, key: "prevention", title: "Prevention", icon: "🛡️" },
  { id: 2, key: "knowledge", title: "Knowledge & Monitoring", icon: "📚" },
  { id: 3, key: "lessons_learned", title: "Lessons Learned", icon: "🎓" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];
type SectionStatus = "idle" | "validating" | "passed" | "failed";

// ── Empty row templates ───────────────────────────────────────────────────────
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

const DEFAULT_DATA: D7FormData = {
  recurrence_risks: [{ ...emptyRisk }, { ...emptyRisk }],
  lesson_disseminations: [{ ...emptyDissemination }, { ...emptyDissemination }],
  replication_validations: [{ ...emptyReplication }, { ...emptyReplication }],
  knowledge_base_updates: [{ ...emptyKB }, { ...emptyKB }],
  long_term_monitoring: [{ ...emptyMonitoring }, { ...emptyMonitoring }],
  ll_conclusion: "",
};

// ── Local pre-validation ──────────────────────────────────────────────────────
function localValidate(sectionKey: SectionKey, data: D7FormData): string[] {
  const errors: string[] = [];

  if (sectionKey === "prevention") {
    const hasRisk = data.recurrence_risks.some(
      (r) => r.area_line_product.trim() || r.action_taken.trim(),
    );
    if (!hasRisk)
      errors.push("Fill at least one risk of recurrence row (area/action)");

    const hasReplication = data.replication_validations.some(
      (r) => r.line_site.trim() || r.action_replicated.trim(),
    );
    if (!hasReplication)
      errors.push("Fill at least one replication validation row");
  }

  if (sectionKey === "knowledge") {
    const hasKB = data.knowledge_base_updates.some(
      (k) => k.document_type.trim() || k.topic_reference.trim(),
    );
    if (!hasKB) errors.push("Fill at least one knowledge base update row");

    const hasMonitoring = data.long_term_monitoring.some(
      (m) => m.checkpoint_type.trim() || m.frequency.trim(),
    );
    if (!hasMonitoring)
      errors.push("Fill at least one long-term monitoring checkpoint");
  }

  if (sectionKey === "lessons_learned") {
    const hasDissemination = data.lesson_disseminations.some(
      (d) => d.audience_team.trim() || d.method.trim(),
    );
    if (!hasDissemination)
      errors.push("Fill at least one lesson dissemination row");
    if (!data.ll_conclusion.trim())
      errors.push("Write a lessons learned conclusion summary");
  }

  return errors;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function D7({ onRefreshSteps, onValidationUpdate }: D7Props) {
  const meta = STEPS.find((s) => s.code === "D7")!;
  const navigate = useNavigate();
  const { complaintId } = useParams<{ complaintId: string }>();

  const [currentSection, setCurrentSection] = useState(1);
  const [sectionStatus, setSectionStatus] = useState<
    Record<SectionKey, SectionStatus>
  >({
    prevention: "idle",
    knowledge: "idle",
    lessons_learned: "idle",
  });
  const [sectionValidations, setSectionValidations] = useState<
    Record<SectionKey, SectionValidationResult | null>
  >({ prevention: null, knowledge: null, lessons_learned: null });
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [isSectionValidating, setIsSectionValidating] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { loading, saving, stepId, data, setData, handleSaveDraft } =
    useStepData<D7FormData>("D7", DEFAULT_DATA);

  // ── Restore section statuses on mount ─────────────────────────────────────
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

  // ── Sync ChatCoach on section switch ──────────────────────────────────────
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
          const idx = STEPS.findIndex((s) => s.code === "D7");
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

  // ── Row helpers ───────────────────────────────────────────────────────────
  const updateRisk = (i: number, f: keyof RecurrenceRisk, v: string) => {
    const u = [...data.recurrence_risks];
    u[i] = { ...u[i], [f]: v };
    setData({ ...data, recurrence_risks: u });
  };
  const addRisk = () =>
    setData({
      ...data,
      recurrence_risks: [...data.recurrence_risks, { ...emptyRisk }],
    });
  const removeRisk = (i: number) => {
    if (data.recurrence_risks.length <= 1) return;
    setData({
      ...data,
      recurrence_risks: data.recurrence_risks.filter((_, idx) => idx !== i),
    });
  };

  const updateReplication = (
    i: number,
    f: keyof ReplicationValidation,
    v: string,
  ) => {
    const u = [...data.replication_validations];
    u[i] = { ...u[i], [f]: v };
    setData({ ...data, replication_validations: u });
  };
  const addReplication = () =>
    setData({
      ...data,
      replication_validations: [
        ...data.replication_validations,
        { ...emptyReplication },
      ],
    });
  const removeReplication = (i: number) => {
    if (data.replication_validations.length <= 1) return;
    setData({
      ...data,
      replication_validations: data.replication_validations.filter(
        (_, idx) => idx !== i,
      ),
    });
  };

  const updateKB = (i: number, f: keyof KnowledgeBaseUpdate, v: string) => {
    const u = [...data.knowledge_base_updates];
    u[i] = { ...u[i], [f]: v };
    setData({ ...data, knowledge_base_updates: u });
  };
  const addKB = () =>
    setData({
      ...data,
      knowledge_base_updates: [...data.knowledge_base_updates, { ...emptyKB }],
    });
  const removeKB = (i: number) => {
    if (data.knowledge_base_updates.length <= 1) return;
    setData({
      ...data,
      knowledge_base_updates: data.knowledge_base_updates.filter(
        (_, idx) => idx !== i,
      ),
    });
  };

  const updateMonitoring = (
    i: number,
    f: keyof LongTermMonitoring,
    v: string,
  ) => {
    const u = [...data.long_term_monitoring];
    u[i] = { ...u[i], [f]: v };
    setData({ ...data, long_term_monitoring: u });
  };
  const addMonitoring = () =>
    setData({
      ...data,
      long_term_monitoring: [
        ...data.long_term_monitoring,
        { ...emptyMonitoring },
      ],
    });
  const removeMonitoring = (i: number) => {
    if (data.long_term_monitoring.length <= 1) return;
    setData({
      ...data,
      long_term_monitoring: data.long_term_monitoring.filter(
        (_, idx) => idx !== i,
      ),
    });
  };

  const updateDissemination = (
    i: number,
    f: keyof LessonLearningDissemination,
    v: string,
  ) => {
    const u = [...data.lesson_disseminations];
    u[i] = { ...u[i], [f]: v };
    setData({ ...data, lesson_disseminations: u });
  };
  const addDissemination = () =>
    setData({
      ...data,
      lesson_disseminations: [
        ...data.lesson_disseminations,
        { ...emptyDissemination },
      ],
    });
  const removeDissemination = (i: number) => {
    if (data.lesson_disseminations.length <= 1) return;
    setData({
      ...data,
      lesson_disseminations: data.lesson_disseminations.filter(
        (_, idx) => idx !== i,
      ),
    });
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

  const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
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
  );

  const AddBtn = ({
    onClick,
    label,
  }: {
    onClick: () => void;
    label: string;
  }) => (
    <div className="mt-3">
      <button
        onClick={onClick}
        className="btn text-sm hover:scale-105 transition-transform"
      >
        <span>➕</span>
        <span>{label}</span>
      </button>
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
          <ValidationSpinner stepCode="D7" />
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
              D7 Fully Validated!
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
              Prevention, knowledge, and lessons learned all confirmed.
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
              Redirecting to D8 in {countdown}s…
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

      {/* ══ SECTION 1 — PREVENTION ══════════════════════════════════════════ */}
      {currentSection === 1 && (
        <div className="section">
          <h3>I. Prevention & Replication</h3>

          {/* Part A — Risk of Recurrence */}
          <h4 className="font-semibold text-gray-700 mb-3">
            A. Risk of Recurrence Elsewhere
          </h4>
          <div className="overflow-x-auto mb-6">
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
                  <th className="min-w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {data.recurrence_risks.map((risk, i) => (
                  <tr key={i}>
                    <td className="bg-blue-50/30">
                      <input
                        placeholder="Area/Line/Product..."
                        className="w-full font-medium"
                        value={risk.area_line_product}
                        onChange={(e) =>
                          updateRisk(i, "area_line_product", e.target.value)
                        }
                      />
                    </td>
                    <td className="bg-amber-50/30">
                      <select
                        className="w-full font-medium"
                        value={risk.similar_risk_present}
                        onChange={(e) =>
                          updateRisk(i, "similar_risk_present", e.target.value)
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
                          updateRisk(i, "action_taken", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      {data.recurrence_risks.length > 1 && (
                        <DeleteBtn onClick={() => removeRisk(i)} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddBtn onClick={addRisk} label="Add row" />

          {/* Divider */}
          <div style={{ borderTop: "2px dashed #e2e8f0", margin: "28px 0" }} />

          {/* Part B — Replication Validation */}
          <h4 className="font-semibold text-gray-700 mb-3">
            B. Replication Validation
          </h4>
          <div className="overflow-x-auto">
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
                  <th className="min-w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {data.replication_validations.map((item, i) => (
                  <tr key={i}>
                    <td className="bg-blue-50/30">
                      <input
                        placeholder="Line/Site..."
                        className="w-full font-medium"
                        value={item.line_site}
                        onChange={(e) =>
                          updateReplication(i, "line_site", e.target.value)
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
                            i,
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
                            i,
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
                          updateReplication(i, "confirmed_by", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      {data.replication_validations.length > 1 && (
                        <DeleteBtn onClick={() => removeReplication(i)} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddBtn onClick={addReplication} label="Add replication" />

          <SectionFooter
            sectionKey="prevention"
            status={sectionStatus.prevention}
            isValidating={
              isSectionValidating && activeSectionKey === "prevention"
            }
            onSubmit={() => handleSectionSubmit(1)}
          />
        </div>
      )}

      {/* ══ SECTION 2 — KNOWLEDGE & MONITORING ══════════════════════════════ */}
      {currentSection === 2 && (
        <div className="section">
          <h3>II. Knowledge & Long-Term Monitoring</h3>

          {/* Part A — Knowledge Base Update */}
          <h4 className="font-semibold text-gray-700 mb-3">
            A. Knowledge Base Update
          </h4>
          <div className="overflow-x-auto mb-6">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[150px] bg-indigo-50">Document Type</th>
                  <th className="min-w-[250px] bg-blue-50">
                    Topic / Reference
                  </th>
                  <th className="min-w-[120px] bg-green-50">Owner</th>
                  <th className="min-w-[200px] bg-amber-50">Location / Link</th>
                  <th className="min-w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {data.knowledge_base_updates.map((item, i) => (
                  <tr key={i}>
                    <td className="bg-indigo-50/30">
                      <input
                        placeholder="Document type..."
                        className="w-full font-medium"
                        value={item.document_type}
                        onChange={(e) =>
                          updateKB(i, "document_type", e.target.value)
                        }
                      />
                    </td>
                    <td className="bg-blue-50/30">
                      <input
                        placeholder="Topic/Reference..."
                        className="w-full font-medium"
                        value={item.topic_reference}
                        onChange={(e) =>
                          updateKB(i, "topic_reference", e.target.value)
                        }
                      />
                    </td>
                    <td className="bg-green-50/30">
                      <input
                        placeholder="Owner..."
                        className="w-full font-medium"
                        value={item.owner}
                        onChange={(e) => updateKB(i, "owner", e.target.value)}
                      />
                    </td>
                    <td className="bg-amber-50/30">
                      <input
                        placeholder="Location/Link..."
                        className="w-full font-medium"
                        value={item.location_link}
                        onChange={(e) =>
                          updateKB(i, "location_link", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      {data.knowledge_base_updates.length > 1 && (
                        <DeleteBtn onClick={() => removeKB(i)} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddBtn onClick={addKB} label="Add document" />

          {/* Divider */}
          <div style={{ borderTop: "2px dashed #e2e8f0", margin: "28px 0" }} />

          {/* Part B — Long-Term Monitoring */}
          <h4 className="font-semibold text-gray-700 mb-3">
            B. Long-Term Monitoring
          </h4>
          <div className="overflow-x-auto">
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
                  <th className="min-w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {data.long_term_monitoring.map((item, i) => (
                  <tr key={i}>
                    <td className="bg-purple-50/30">
                      <input
                        placeholder="Checkpoint..."
                        className="w-full font-medium"
                        value={item.checkpoint_type}
                        onChange={(e) =>
                          updateMonitoring(i, "checkpoint_type", e.target.value)
                        }
                      />
                    </td>
                    <td className="bg-blue-50/30">
                      <input
                        placeholder="Frequency..."
                        className="w-full font-medium"
                        value={item.frequency}
                        onChange={(e) =>
                          updateMonitoring(i, "frequency", e.target.value)
                        }
                      />
                    </td>
                    <td className="bg-green-50/30">
                      <input
                        placeholder="Owner..."
                        className="w-full font-medium"
                        value={item.owner}
                        onChange={(e) =>
                          updateMonitoring(i, "owner", e.target.value)
                        }
                      />
                    </td>
                    <td className="bg-amber-50/30">
                      <input
                        type="date"
                        className="w-full font-medium"
                        value={item.start_date}
                        onChange={(e) =>
                          updateMonitoring(i, "start_date", e.target.value)
                        }
                      />
                    </td>
                    <td className="bg-indigo-50/30">
                      <input
                        placeholder="Notes..."
                        className="w-full font-medium"
                        value={item.notes}
                        onChange={(e) =>
                          updateMonitoring(i, "notes", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      {data.long_term_monitoring.length > 1 && (
                        <DeleteBtn onClick={() => removeMonitoring(i)} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddBtn onClick={addMonitoring} label="Add checkpoint" />

          <SectionFooter
            sectionKey="knowledge"
            status={sectionStatus.knowledge}
            isValidating={
              isSectionValidating && activeSectionKey === "knowledge"
            }
            onSubmit={() => handleSectionSubmit(2)}
          />
        </div>
      )}

      {/* ══ SECTION 3 — LESSONS LEARNED ═════════════════════════════════════ */}
      {currentSection === 3 && (
        <div className="section">
          <h3>III. Lessons Learned</h3>

          {/* Part A — Dissemination */}
          <h4 className="font-semibold text-gray-700 mb-3">
            A. Lesson Learning Dissemination
          </h4>
          <div className="overflow-x-auto mb-6">
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
                  <th className="min-w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {data.lesson_disseminations.map((item, i) => (
                  <tr key={i}>
                    <td className="bg-purple-50/30">
                      <input
                        placeholder="Team/Audience..."
                        className="w-full font-medium"
                        value={item.audience_team}
                        onChange={(e) =>
                          updateDissemination(
                            i,
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
                          updateDissemination(i, "method", e.target.value)
                        }
                      />
                    </td>
                    <td className="bg-amber-50/30">
                      <input
                        type="date"
                        className="w-full font-medium"
                        value={item.date}
                        onChange={(e) =>
                          updateDissemination(i, "date", e.target.value)
                        }
                      />
                    </td>
                    <td className="bg-green-50/30">
                      <input
                        placeholder="Owner..."
                        className="w-full font-medium"
                        value={item.owner}
                        onChange={(e) =>
                          updateDissemination(i, "owner", e.target.value)
                        }
                      />
                    </td>
                    <td className="bg-indigo-50/30">
                      <input
                        placeholder="Evidence..."
                        className="w-full font-medium"
                        value={item.evidence}
                        onChange={(e) =>
                          updateDissemination(i, "evidence", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      {data.lesson_disseminations.length > 1 && (
                        <DeleteBtn onClick={() => removeDissemination(i)} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddBtn onClick={addDissemination} label="Add dissemination" />

          {/* Divider */}
          <div style={{ borderTop: "2px dashed #e2e8f0", margin: "28px 0" }} />

          {/* Part B — LL Conclusion */}
          <h4 className="font-semibold text-gray-700 mb-3">
            B. Lessons Learned Conclusion
          </h4>
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

          <SectionFooter
            sectionKey="lessons_learned"
            status={sectionStatus.lessons_learned}
            isValidating={
              isSectionValidating && activeSectionKey === "lessons_learned"
            }
            onSubmit={() => handleSectionSubmit(3)}
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
