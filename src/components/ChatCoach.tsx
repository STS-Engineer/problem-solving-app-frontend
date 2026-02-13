import { StepCode } from "../lib/steps";

const INDUSTRIAL_COLORS = {
  primary: "#2C3E50",
  accent: "#4A7CFF",
  success: "#27AE60",
  warning: "#F39C12",
  danger: "#E74C3C",
  border: "#BDC3C7",
};

type CoachMessage = {
  type: "ok" | "fail" | "note";
  time: string;
  title: string;
  bullets?: string[];
  suggestion?: string;
};

const sampleByStep: Record<StepCode, CoachMessage[]> = {
  D1: [
    {
      type: "ok",
      time: "10:12",
      title: "Team validated",
      bullets: [
        "Leader identified",
        "Production + Quality roles present",
        "Authority confirmed",
      ],
    },
  ],
  D2: [
    {
      type: "ok",
      time: "11:40",
      title: "Description validated",
      bullets: ["Standard cited", "IS/IS NOT complete", "Evidence attached"],
    },
  ],
  D3: [
    {
      type: "note",
      time: "09:12",
      title: "Reminder (strict coach)",
      bullets: [
        "Document NOK containment + suspect parts",
        "Define sorting/certification method before restart",
        "Trace the alert (reference) and recipients",
      ],
    },
    {
      type: "fail",
      time: "09:13",
      title: "Blocking points detected",
      bullets: [
        "No evidence of 100% sorting (if customer defect / escape risk).",
        "Production restart: authorization/conditions incomplete.",
        "Containment results not filled in (quantities, status).",
      ],
      suggestion:
        "Complete the results (sorted qty, NOK qty), attach the delivery note/certificate, then relaunch 'Check & Validate'.",
    },
  ],
  D4: [
    {
      type: "note",
      time: "—",
      title: "Expected",
      bullets: [
        "5 Why (occurrence + non-detection)",
        "Validation of the cause (repro/test/data)",
      ],
    },
  ],
  D5: [
    {
      type: "note",
      time: "—",
      title: "Expected",
      bullets: ["1 action per root cause", "Owner + due date + evidence"],
    },
  ],
  D6: [
    {
      type: "note",
      time: "—",
      title: "Expected",
      bullets: ["Monitoring (qty, scrap)", "Shopfloor checklist + audit"],
    },
  ],
  D7: [
    {
      type: "note",
      time: "—",
      title: "Expected",
      bullets: [
        "Replication",
        "Update WI/CP/PFMEA",
        "Lesson learned + LT monitoring",
      ],
    },
  ],
  D8: [
    {
      type: "note",
      time: "—",
      title: "Expected",
      bullets: [
        "Conclusion",
        "Customer satisfaction (if applicable)",
        "All steps validated",
      ],
    },
  ],
};

function getMessageStyle(type: CoachMessage["type"]) {
  if (type === "ok") {
    return {
      bg: "rgba(39, 174, 96, 0.05)",
      border: INDUSTRIAL_COLORS.success,
      icon: "✅",
      iconBg: "linear-gradient(135deg, #27AE60 0%, #1E8449 100%)",
    };
  }
  if (type === "fail") {
    return {
      bg: "rgba(231, 76, 60, 0.05)",
      border: INDUSTRIAL_COLORS.danger,
      icon: "⚠️",
      iconBg: "linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)",
    };
  }
  return {
    bg: "rgba(74, 124, 255, 0.05)",
    border: INDUSTRIAL_COLORS.accent,
    icon: "💡",
    iconBg: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
  };
}

interface ChatCoachProps {
  step: StepCode;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function ChatCoach({
  step,
  isCollapsed,
  onToggle,
}: ChatCoachProps) {
  const messages = sampleByStep[step] ?? [];

  return (
    <aside
      style={{
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        background: "white",
        width: isCollapsed ? "60px" : "360px",
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
          left: isCollapsed ? 8 : 12,
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
        title={isCollapsed ? "Expand Chat Coach" : "Collapse Chat Coach"}
      >
        <span style={{ fontSize: 16 }}>{isCollapsed ? "←" : "→"}</span>
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
        {!isCollapsed ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background:
                      "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  💬
                </div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    margin: 0,
                    color: INDUSTRIAL_COLORS.primary,
                  }}
                >
                  Validation Engineer
                </h3>
              </div>
              <span
                style={{
                  padding: "4px 10px",
                  background: "rgba(243, 156, 18, 0.1)",
                  border: `1px solid ${INDUSTRIAL_COLORS.warning}`,
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  color: INDUSTRIAL_COLORS.warning,
                }}
              >
                Strict coach
              </span>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#78909C",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Automatic verification of quality requirements according to 8D
              standards
            </p>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            💬
          </div>
        )}
      </div>

      {/* Messages Feed */}
      {!isCollapsed ? (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
          }}
        >
          {messages.map((m, idx) => {
            const style = getMessageStyle(m.type);

            return (
              <div
                key={idx}
                style={{
                  marginBottom: 16,
                  padding: 16,
                  background: "white",
                  border: `2px solid ${style.border}`,
                  borderLeft: `6px solid ${style.border}`,
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: m.bullets?.length || m.suggestion ? 12 : 0,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        background: style.iconBg,
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                      }}
                    >
                      {style.icon}
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: INDUSTRIAL_COLORS.primary,
                      }}
                    >
                      {m.title}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#78909C",
                      background: "rgba(189, 195, 199, 0.1)",
                      padding: "4px 8px",
                      borderRadius: 6,
                    }}
                  >
                    {m.time}
                  </span>
                </div>

                {m.bullets?.length ? (
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 20,
                      listStyle: "none",
                    }}
                  >
                    {m.bullets.map((b, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 13,
                          color: INDUSTRIAL_COLORS.primary,
                          marginBottom: 8,
                          lineHeight: 1.5,
                          position: "relative",
                          paddingLeft: 16,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 6,
                            width: 6,
                            height: 6,
                            background: style.border,
                            borderRadius: "50%",
                          }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {m.suggestion ? (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      background: "rgba(74, 124, 255, 0.05)",
                      borderRadius: 8,
                      border: `1px solid ${INDUSTRIAL_COLORS.accent}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: INDUSTRIAL_COLORS.accent,
                        marginBottom: 6,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      💡 Suggestion
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: INDUSTRIAL_COLORS.primary,
                        lineHeight: 1.5,
                      }}
                    >
                      {m.suggestion}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "16px 8px",
          }}
        >
          {messages.map((m, idx) => {
            const style = getMessageStyle(m.type);
            return (
              <div
                key={idx}
                style={{
                  width: 40,
                  height: 40,
                  background: style.iconBg,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  cursor: "pointer",
                }}
                title={m.title}
              >
                {style.icon}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div
          style={{
            padding: "20px",
            borderTop: `1px solid ${INDUSTRIAL_COLORS.border}`,
            background: "white",
          }}
        >
          <button
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 4px 12px rgba(74, 124, 255, 0.3)",
              transition: "all 0.2s ease",
              marginBottom: 16,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(74, 124, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(74, 124, 255, 0.3)";
            }}
          >
            <span style={{ fontSize: 18 }}>✨</span>
            <span>Check & Validate</span>
          </button>

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
                width: 32,
                height: 32,
                background: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              KB
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: INDUSTRIAL_COLORS.primary,
                  marginBottom: 4,
                }}
              >
                Knowledge Base
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#78909C",
                  lineHeight: 1.4,
                }}
              >
                PDCA-FTA + Guides E1..E8 (extracts)
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
