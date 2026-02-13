import { NavLink, useParams } from "react-router-dom";
import { STEPS, StepCode } from "../lib/steps";

const INDUSTRIAL_COLORS = {
  primary: "#2C3E50",
  accent: "#4A7CFF",
  success: "#27AE60",
  warning: "#F39C12",
  border: "#BDC3C7",
};
type StepStatus = "draft" | "submitted" | "validated" | "rejected";

type StepsState = Record<StepCode, { status: StepStatus }>;

function statusBadge(status: string) {
  const badges = {
    validated: {
      text: "Validated",
      bg: "rgba(39, 174, 96, 0.1)",
      border: INDUSTRIAL_COLORS.success,
      color: INDUSTRIAL_COLORS.success,
    },
    submitted: {
      text: "Submitted",
      bg: "rgba(243, 156, 18, 0.1)",
      border: INDUSTRIAL_COLORS.warning,
      color: INDUSTRIAL_COLORS.warning,
    },
    draft: {
      text: "Draft",
      bg: "rgba(189, 195, 199, 0.1)",
      border: INDUSTRIAL_COLORS.border,
      color: "#78909C",
    },
  };

  const badge = badges[status as keyof typeof badges] || badges.draft;

  return (
    <span
      style={{
        padding: "4px 10px",
        background: badge.bg,
        border: `1px solid ${badge.border}`,
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 700,
        color: badge.color,
      }}
    >
      {badge.text}
    </span>
  );
}

interface SidebarProps {
  steps: StepsState | null;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  steps,
  isCollapsed,
  onToggle,
}: SidebarProps) {
  const { complaintId } = useParams<{ complaintId: string }>();
  const getStatus = (code: StepCode) => steps?.[code]?.status ?? "draft";

  return (
    <aside
      style={{
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        background: "white",
        width: isCollapsed ? "60px" : "280px",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          position: "absolute",
          top: 12,
          right: isCollapsed ? 8 : 12,
          width: 36,
          height: 36,
          background: "white",
          border: `2px solid ${INDUSTRIAL_COLORS.accent}`,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          transition: "all 0.2s ease",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = INDUSTRIAL_COLORS.accent;
          e.currentTarget.style.color = "white";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "white";
          e.currentTarget.style.color = INDUSTRIAL_COLORS.accent;
          e.currentTarget.style.transform = "scale(1)";
        }}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <span style={{ fontSize: 16, transition: "transform 0.3s ease" }}>
          {isCollapsed ? "→" : "←"}
        </span>
      </button>

      {/* Header */}
      <div
        style={{
          padding: isCollapsed ? "24px 8px" : "24px 20px",
          borderBottom: `3px solid ${INDUSTRIAL_COLORS.accent}`,
          background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
          transition: "padding 0.3s ease",
        }}
      >
        {!isCollapsed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              opacity: isCollapsed ? 0 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🗂️
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                margin: 0,
                color: INDUSTRIAL_COLORS.primary,
                whiteSpace: "nowrap",
              }}
            >
              8D Navigation
            </h3>
          </div>
        )}
        {isCollapsed && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            🗂️
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "12px 0",
        }}
      >
        {STEPS.map((s, idx) => {
          const status = getStatus(s.code as StepCode);
          const tooltip = `${s.code} — ${s.title} (Step ${idx + 1}/8 • ${status})`;

          return (
            <NavLink
              key={s.code}
              to={`/8d/${complaintId}/${s.code}`}
              title={tooltip} // ✅ tooltip works on hover anywhere (title/status/step)
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "space-between",
                padding: isCollapsed ? "12px 8px" : "16px 20px",
                margin: isCollapsed ? "4px 8px" : "4px 12px",
                borderRadius: 10,
                textDecoration: "none",
                background: isActive
                  ? "linear-gradient(135deg, rgba(74, 124, 255, 0.1) 0%, rgba(74, 124, 255, 0.05) 100%)"
                  : "transparent",
                border: isActive
                  ? `2px solid ${INDUSTRIAL_COLORS.accent}`
                  : "2px solid transparent",
                transition: "all 0.2s ease",
                position: "relative",
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains("active")) {
                  e.currentTarget.style.background = "rgba(74, 124, 255, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(74, 124, 255, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains("active")) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >
              {({ isActive }) =>
                isCollapsed ? (
                  // ✅ Collapsed view: ONLY code (no step/status overflow)
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: isActive
                        ? "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)"
                        : "rgba(189, 195, 199, 0.2)",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      color: isActive ? "white" : INDUSTRIAL_COLORS.primary,
                      transition: "all 0.2s ease",
                      position: "relative",
                    }}
                  >
                    {s.code}
                    {status === "validated" && (
                      <div
                        style={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          width: 12,
                          height: 12,
                          background: INDUSTRIAL_COLORS.success,
                          border: "2px solid white",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  </div>
                ) : (
                  // ✅ Expanded view: title ellipsis + badge pinned right
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          background: isActive
                            ? "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)"
                            : "rgba(189, 195, 199, 0.2)",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 700,
                          color: isActive ? "white" : INDUSTRIAL_COLORS.primary,
                          flexShrink: 0,
                        }}
                      >
                        {s.code}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: isActive
                              ? INDUSTRIAL_COLORS.accent
                              : INDUSTRIAL_COLORS.primary,
                            marginBottom: 2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {s.title}
                        </div>

                        <div
                          style={{
                            fontSize: 11,
                            color: "#78909C",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Step {idx + 1}/8
                        </div>
                      </div>
                    </div>

                    <div style={{ flexShrink: 0, marginLeft: 12 }}>
                      {statusBadge(status)}
                    </div>
                  </>
                )
              }
            </NavLink>
          );
        })}
      </div>

      {/* Footer Tip */}
      {!isCollapsed && (
        <div
          style={{
            padding: "16px 20px",
            borderTop: `1px solid ${INDUSTRIAL_COLORS.border}`,
            background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
            opacity: isCollapsed ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "start",
              gap: 10,
              padding: 12,
              background: "rgba(74, 124, 255, 0.05)",
              borderLeft: `3px solid ${INDUSTRIAL_COLORS.accent}`,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              💡
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: INDUSTRIAL_COLORS.primary,
                  marginBottom: 4,
                }}
              >
                Note
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#78909C",
                  lineHeight: 1.4,
                }}
              >
                Validate each step before generating the final report
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
