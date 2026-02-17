// src/components/ChatCoach.tsx
import { StepCode } from "../lib/steps";
import { ValidationResult } from "../services/api/reports";

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

// Static guidelines for each step (shown at top)
const staticGuidelinesByStep: Record<StepCode, CoachMessage[]> = {
  D1: [
    {
      type: "note",
      time: "—",
      title: "Expected Requirements",
      bullets: [
        "Team leader clearly identified",
        "At least 2 team members (Production + Quality)",
        "Each member has defined role",
      ],
    },
  ],
  D2: [
    {
      type: "note",
      time: "—",
      title: "Expected Requirements",
      bullets: [
        "Complete 4W2H description (What, Where, When, Who, How, How Many)",
        "Standard or specification referenced",
        "IS / IS NOT analysis completed",
        "Evidence and quantified data provided",
      ],
    },
  ],
  D3: [
    {
      type: "note",
      time: "—",
      title: "Expected Requirements",
      bullets: [
        "Defective parts contained (returned/isolated/identified)",
        "100% sorting completed if customer impact",
        "Production restart conditions defined",
        "Customer notification documented",
      ],
    },
  ],
  D4: [
    {
      type: "note",
      time: "—",
      title: "Expected Requirements",
      bullets: [
        "Root cause for OCCURRENCE identified (5 Why)",
        "Root cause for NON-DETECTION identified (5 Why)",
        "Both causes validated with evidence",
        "Physical verification or testing performed",
      ],
    },
  ],
  D5: [
    {
      type: "note",
      time: "—",
      title: "Expected Requirements",
      bullets: [
        "1 corrective action per root cause (minimum)",
        "Each action has: responsible + due date",
        "Actions target both occurrence AND detection",
        "Measurable and verifiable actions",
      ],
    },
  ],
  D6: [
    {
      type: "note",
      time: "—",
      title: "Expected Requirements",
      bullets: [
        "Implementation evidence provided",
        "Monitoring metrics defined (qty, scrap rate)",
        "Shop floor verification checklist completed (≥50%)",
        "Audit performed and documented",
      ],
    },
  ],
  D7: [
    {
      type: "note",
      time: "—",
      title: "Expected Requirements",
      bullets: [
        "Lessons learned documented",
        "Replication plan to other products/processes",
        "Standards updated (WI/CP/PFMEA)",
        "Long-term monitoring plan established",
      ],
    },
  ],
  D8: [
    {
      type: "note",
      time: "—",
      title: "Expected Requirements",
      bullets: [
        "Closure statement summarizing the case",
        "All previous steps validated",
        "Customer satisfaction confirmed (if applicable)",
        "Team recognition and sign-off",
      ],
    },
  ],
};

// Convert validation result to messages
function validationToMessages(validation: ValidationResult): CoachMessage[] {
  const messages: CoachMessage[] = [];
  const now = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Overall assessment message
  if (validation.decision === "pass") {
    messages.push({
      type: "ok",
      time: now,
      title: "✅ Validation Passed",
      bullets: [validation.overall_assessment],
    });
  } else {
    messages.push({
      type: "fail",
      time: now,
      title: "⚠️ Validation Failed",
      bullets: [validation.overall_assessment],
    });
  }

  // Missing fields
  if (validation.missing_fields?.length > 0) {
    messages.push({
      type: "fail",
      time: now,
      title: "❌ Missing Required Fields",
      bullets: validation.missing_fields,
    });
  }

  // Quality issues
  if (validation.quality_issues?.length > 0) {
    messages.push({
      type: "fail",
      time: now,
      title: "⚠️ Quality Issues",
      bullets: validation.quality_issues,
    });
  }

  // Rules violations
  if (validation.rules_violations?.length > 0) {
    messages.push({
      type: "fail",
      time: now,
      title: "🚨 20 Rules Violations",
      bullets: validation.rules_violations,
    });
  }

  // Suggestions
  if (validation.suggestions?.length > 0) {
    messages.push({
      type: "note",
      time: now,
      title: "💡 Recommendations",
      bullets: validation.suggestions,
    });
  }

  // Field improvements
  if (
    validation.field_improvements &&
    Object.keys(validation.field_improvements).length > 0
  ) {
    const improvements = Object.entries(validation.field_improvements).map(
      ([field, improvement]) =>
        `${field.replace(/_/g, " ").toUpperCase()}: ${improvement}`,
    );
    messages.push({
      type: "note",
      time: now,
      title: "✨ Suggested Improvements",
      bullets: improvements,
    });
  }

  return messages;
}

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
  validation?: ValidationResult | null;
}

export default function ChatCoach({
  step,
  isCollapsed,
  onToggle,
  validation,
}: ChatCoachProps) {
  // Static guidelines (always shown at top)
  const staticGuidelines = staticGuidelinesByStep[step] ?? [];

  // Validation messages (shown below guidelines after validation)
  const validationMessages = validation ? validationToMessages(validation) : [];

  // Combine: static guidelines first, then validation results
  const allMessages = [...staticGuidelines, ...validationMessages];

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
          {/* Validation status banner (if validation exists) */}
          {validation && (
            <div
              style={{
                marginBottom: 16,
                padding: 16,
                background:
                  validation.decision === "pass"
                    ? "linear-gradient(135deg, #27AE60 0%, #1E8449 100%)"
                    : "linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)",
                borderRadius: 12,
                color: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {validation.decision === "pass" ? "✅" : "⚠️"}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    {validation.decision === "pass"
                      ? "Validation Passed"
                      : "Improvements Needed"}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.9,
                    }}
                  >
                    {new Date().toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All messages (static + validation) */}
          {allMessages.map((m, idx) => {
            const style = getMessageStyle(m.type);
            const isStatic = idx < staticGuidelines.length;

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
                  opacity: isStatic && validation ? 0.7 : 1, // Dim static guidelines when validation exists
                  transition: "opacity 0.3s ease",
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
          {allMessages.map((m, idx) => {
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
