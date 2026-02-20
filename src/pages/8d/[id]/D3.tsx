// src/pages/8d/[id]/D3.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStepData } from "../../../hooks/useStepData";
import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import {
  ValidationResult,
  SectionValidationResult,
  saveStepProgress,
  submitSection,
  getSectionValidations,
} from "../../../services/api/reports";
import ValidationSpinner from "../../../components/ValidationSpinner";

type SuspectedLocation =
  | "supplier_site"
  | "in_transit"
  | "production_floor"
  | "warehouse"
  | "customer_site"
  | "others";

interface DefectedPartStatus {
  returned: boolean;
  isolated: boolean;
  isolated_location: string;
  identified: boolean;
  identified_method: string;
}
interface SuspectedPartsRow {
  location: SuspectedLocation;
  inventory: string;
  actions: string;
  leader: string;
  results: string;
}
interface AlertCommunicatedTo {
  production_shift_leaders: boolean;
  quality_control: boolean;
  warehouse: boolean;
  maintenance: boolean;
  customer_contact: boolean;
  production_planner: boolean;
}
interface RestartProduction {
  when: string;
  first_certified_lot: string;
  approved_by: string;
  method: string;
  identification: string;
}
interface D3FormData {
  defected_part_status: DefectedPartStatus;
  suspected_parts_status: SuspectedPartsRow[];
  alert_communicated_to: AlertCommunicatedTo;
  alert_number: string;
  restart_production: RestartProduction;
  containment_responsible: string;
}
interface D3Props {
  onRefreshSteps: () => void;
  onValidationUpdate: (validation: ValidationResult | null) => void;
}

// ── 2 sections only ───────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 1, key: "containment", title: "Containment", icon: "🔴" },
  { id: 2, key: "restart", title: "Restart & Responsible", icon: "🔄" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];
type SectionStatus = "idle" | "validating" | "passed" | "failed";

const DEFAULT_SUSPECTED: SuspectedPartsRow[] = [
  {
    location: "supplier_site",
    inventory: "",
    actions: "",
    leader: "",
    results: "",
  },
  {
    location: "in_transit",
    inventory: "",
    actions: "",
    leader: "",
    results: "",
  },
  {
    location: "production_floor",
    inventory: "",
    actions: "",
    leader: "",
    results: "",
  },
  {
    location: "warehouse",
    inventory: "",
    actions: "",
    leader: "",
    results: "",
  },
  {
    location: "customer_site",
    inventory: "",
    actions: "",
    leader: "",
    results: "",
  },
  { location: "others", inventory: "", actions: "", leader: "", results: "" },
];

// ── Local pre-validation ──────────────────────────────────────────────────────
function localValidate(sectionKey: SectionKey, data: D3FormData): string[] {
  const errors: string[] = [];

  if (sectionKey === "containment") {
    const d = data.defected_part_status;
    if (!d.returned && !d.isolated && !d.identified)
      errors.push("At least one defected part status must be checked");
    if (d.isolated && !d.isolated_location.trim())
      errors.push("Isolation location is required when 'Isolated' is checked");
    if (d.identified && !d.identified_method.trim())
      errors.push(
        "Identification method is required when 'Identified' is checked",
      );
    const hasAnyRow = data.suspected_parts_status.some(
      (r) => r.inventory.trim() || r.actions.trim(),
    );
    if (!hasAnyRow)
      errors.push("Fill at least one suspected parts location row");
    const alertChecks = Object.values(data.alert_communicated_to);
    if (!alertChecks.some(Boolean))
      errors.push("At least one alert recipient must be checked");
  }

  if (sectionKey === "restart") {
    if (!data.restart_production.approved_by.trim())
      errors.push("Restart approval person is required");
    if (!data.restart_production.method.trim())
      errors.push("Verification method is required");
    if (!data.containment_responsible.trim())
      errors.push("Containment responsible person is required");
  }

  return errors;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function D3({ onRefreshSteps, onValidationUpdate }: D3Props) {
  const meta = STEPS.find((s) => s.code === "D3")!;
  const navigate = useNavigate();
  const { complaintId } = useParams<{ complaintId: string }>();

  const [currentSection, setCurrentSection] = useState(1);
  const [sectionStatus, setSectionStatus] = useState<
    Record<SectionKey, SectionStatus>
  >({
    containment: "idle",
    restart: "idle",
  });
  const [sectionValidations, setSectionValidations] = useState<
    Record<SectionKey, SectionValidationResult | null>
  >({ containment: null, restart: null });
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [isSectionValidating, setIsSectionValidating] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { loading, saving, stepId, data, setData, handleSaveDraft } =
    useStepData<D3FormData>("D3", {
      defected_part_status: {
        returned: false,
        isolated: false,
        isolated_location: "",
        identified: false,
        identified_method: "",
      },
      suspected_parts_status: DEFAULT_SUSPECTED,
      alert_communicated_to: {
        production_shift_leaders: false,
        quality_control: false,
        warehouse: false,
        maintenance: false,
        customer_contact: false,
        production_planner: false,
      },
      alert_number: "",
      restart_production: {
        when: "",
        first_certified_lot: "",
        approved_by: "",
        method: "",
        identification: "",
      },
      containment_responsible: "",
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
          const idx = STEPS.findIndex((s) => s.code === "D3");
          const next = STEPS[idx + 1];
          if (next) navigate(`/8d/${complaintId}/${next.code}`);
          return null;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [allPassed]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setDefected = (patch: Partial<DefectedPartStatus>) =>
    setData({
      ...data,
      defected_part_status: { ...data.defected_part_status, ...patch },
    });

  const setSuspectedRow = (
    loc: SuspectedLocation,
    field: keyof Omit<SuspectedPartsRow, "location">,
    value: string,
  ) =>
    setData({
      ...data,
      suspected_parts_status: data.suspected_parts_status.map((r) =>
        r.location === loc ? { ...r, [field]: value } : r,
      ),
    });

  const setAlertTo = (key: keyof AlertCommunicatedTo, value: boolean) =>
    setData({
      ...data,
      alert_communicated_to: { ...data.alert_communicated_to, [key]: value },
    });

  const setRestart = (patch: Partial<RestartProduction>) =>
    setData({
      ...data,
      restart_production: { ...data.restart_production, ...patch },
    });

  const getSectionKey = (id: number): SectionKey =>
    SECTIONS.find((s) => s.id === id)!.key;

  // ── Per-section submit ────────────────────────────────────────────────────
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

  const suspectedRow = (loc: SuspectedLocation, label: string) => {
    const row = data.suspected_parts_status.find((r) => r.location === loc);
    return (
      <tr key={loc}>
        <td className="font-semibold bg-gray-50">{label}</td>
        {(["inventory", "actions", "leader", "results"] as const).map(
          (field) => (
            <td key={field}>
              <input
                type="text"
                placeholder={
                  field === "inventory"
                    ? "Qty..."
                    : field === "actions"
                      ? "Actions taken..."
                      : field === "leader"
                        ? "Name..."
                        : "Status..."
                }
                className="w-full"
                value={row?.[field] ?? ""}
                onChange={(e) => setSuspectedRow(loc, field, e.target.value)}
              />
            </td>
          ),
        )}
      </tr>
    );
  };

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
          <ValidationSpinner stepCode="D3" />
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
              D3 Fully Validated!
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
              Containment actions confirmed by the AI coach.
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
              Redirecting to D4 in {countdown}s…
            </div>
          </div>
        </div>
      )}

      {/* ── Section tabs ─────────────────────────────────────────────────── */}
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

      {/* ══ SECTION 1 — CONTAINMENT (defected + suspected + alert) ══════════ */}
      {currentSection === 1 && (
        <div className="section">
          {/* I. Defected Part Status */}
          <h3>I. Defected Part Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="field space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={data.defected_part_status.returned}
                  onChange={(e) => setDefected({ returned: e.target.checked })}
                />
                Is it returned to X?
              </label>
            </div>
            <div className="field space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={data.defected_part_status.isolated}
                  onChange={(e) =>
                    setDefected({
                      isolated: e.target.checked,
                      isolated_location: e.target.checked
                        ? data.defected_part_status.isolated_location
                        : "",
                    })
                  }
                />
                Is it isolated?
              </label>
              {data.defected_part_status.isolated && (
                <input
                  type="text"
                  placeholder="Location..."
                  className="w-full"
                  value={data.defected_part_status.isolated_location}
                  onChange={(e) =>
                    setDefected({ isolated_location: e.target.value })
                  }
                />
              )}
            </div>
            <div className="field space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={data.defected_part_status.identified}
                  onChange={(e) =>
                    setDefected({
                      identified: e.target.checked,
                      identified_method: e.target.checked
                        ? data.defected_part_status.identified_method
                        : "",
                    })
                  }
                />
                Identified to avoid mishandling
              </label>
              {data.defected_part_status.identified && (
                <input
                  type="text"
                  placeholder="Identification method..."
                  className="w-full"
                  value={data.defected_part_status.identified_method}
                  onChange={(e) =>
                    setDefected({ identified_method: e.target.value })
                  }
                />
              )}
            </div>
          </div>

          {/* II. Suspected Parts */}
          <h3>II. Suspected Parts Status</h3>
          <div className="overflow-x-auto mb-6">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[150px]">Location</th>
                  <th className="min-w-[120px]">Inventory</th>
                  <th className="min-w-[200px]">Actions</th>
                  <th className="min-w-[120px]">Leader</th>
                  <th className="min-w-[150px]">Results</th>
                </tr>
              </thead>
              <tbody>
                {suspectedRow("supplier_site", "Supplier site")}
                {suspectedRow("in_transit", "In Transit")}
                {suspectedRow("production_floor", "Production floor")}
                {suspectedRow("warehouse", "Warehouse")}
                {suspectedRow("customer_site", "Customer site")}
                {suspectedRow("others", "Others")}
              </tbody>
            </table>
          </div>

          {/* III. Alert */}
          <h3>III. Alert Communicated To</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {(
              Object.keys(
                data.alert_communicated_to,
              ) as (keyof AlertCommunicatedTo)[]
            ).map((key) => (
              <label
                key={key}
                className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={data.alert_communicated_to[key]}
                  onChange={(e) => setAlertTo(key, e.target.checked)}
                />
                <span className="text-sm">
                  {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
          <div className="field">
            <label className="text-sm font-medium">
              Alert # (QRQC log or NCR #)
            </label>
            <input
              type="text"
              placeholder="Reference number..."
              className="w-full font-medium"
              value={data.alert_number}
              onChange={(e) =>
                setData({ ...data, alert_number: e.target.value })
              }
            />
          </div>

          <SectionFooter
            sectionKey="containment"
            status={sectionStatus.containment}
            isValidating={
              isSectionValidating && activeSectionKey === "containment"
            }
            onSubmit={() => handleSectionSubmit(1)}
          />
        </div>
      )}

      {/* ══ SECTION 2 — RESTART & RESPONSIBLE ═══════════════════════════════ */}
      {currentSection === 2 && (
        <div className="section">
          <h3>IV. Restart Production</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="field">
              <label className="text-sm font-medium">
                When (Date, Time, Lot)
              </label>
              <input
                type="text"
                placeholder="Date, time, lot number..."
                className="w-full font-medium"
                value={data.restart_production.when}
                onChange={(e) => setRestart({ when: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="text-sm font-medium">First Certified Lot</label>
              <input
                type="text"
                placeholder="Lot number..."
                className="w-full font-medium"
                value={data.restart_production.first_certified_lot}
                onChange={(e) =>
                  setRestart({ first_certified_lot: e.target.value })
                }
              />
            </div>
          </div>
          <div className="field mb-4">
            <label className="text-sm font-medium">Approved by</label>
            <input
              type="text"
              placeholder="Name and title..."
              className="w-full font-medium"
              value={data.restart_production.approved_by}
              onChange={(e) => setRestart({ approved_by: e.target.value })}
            />
          </div>
          <div className="field mb-4">
            <label className="text-sm font-medium">Verification Method</label>
            <textarea
              placeholder="Describe the verification method..."
              className="w-full"
              rows={3}
              value={data.restart_production.method}
              onChange={(e) => setRestart({ method: e.target.value })}
            />
          </div>
          <div className="field mb-4">
            <label className="text-sm font-medium">
              Parts & Boxes Identification
            </label>
            <textarea
              placeholder="Identification method for parts and packaging..."
              className="w-full"
              rows={3}
              value={data.restart_production.identification}
              onChange={(e) => setRestart({ identification: e.target.value })}
            />
          </div>

          <h3>V. Containment Responsible</h3>
          <div className="field">
            <input
              type="text"
              placeholder="Name and title of responsible person..."
              className="w-full font-medium text-lg"
              value={data.containment_responsible}
              onChange={(e) =>
                setData({ ...data, containment_responsible: e.target.value })
              }
            />
          </div>

          <SectionFooter
            sectionKey="restart"
            status={sectionStatus.restart}
            isValidating={isSectionValidating && activeSectionKey === "restart"}
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
