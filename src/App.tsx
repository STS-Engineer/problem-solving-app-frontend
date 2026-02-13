import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import ChatCoach from "./components/ChatCoach";
import { StepCode } from "./lib/steps";

import ComplaintsList from "./pages/ComplaintsList";
import NewComplaint from "./pages/NewComplaint";
import D1 from "./pages/8d/[id]/D1";
import D2 from "./pages/8d/[id]/D2";
import D3 from "./pages/8d/[id]/D3";
import D4 from "./pages/8d/[id]/D4";
import D5 from "./pages/8d/[id]/D5";
import D6 from "./pages/8d/[id]/D6";
import D7 from "./pages/8d/[id]/D7";
import D8 from "./pages/8d/[id]/D8";
import { getStepsByComplaintId } from "./services/api/reports";
import { Toaster } from "react-hot-toast";

const INDUSTRIAL_COLORS = {
  primary: "#2C3E50",
  secondary: "#34495E",
  accent: "#4A7CFF",
  success: "#27AE60",
  warning: "#F39C12",
  danger: "#E74C3C",
  info: "#3498DB",
  dark: "#1A1A1A",
  light: "#ECF0F1",
  border: "#BDC3C7",
  background: "linear-gradient(135deg, #E8EAF6 0%, #F5F7FA 100%)",
};

type StepStatus = "draft" | "submitted" | "validated" | "rejected";
type StepsState = Record<StepCode, { status: StepStatus }>;

function EightDShell() {
  const { complaintId, step } = useParams<{
    complaintId: string;
    step: string;
  }>();
  const complaintIdNum = Number(complaintId);

  // State for collapsible panels
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);

  if (!complaintIdNum || Number.isNaN(complaintIdNum)) {
    return <div>❌ Invalid complaint ID</div>;
  }

  const stepCode = (step ?? "D1") as StepCode;

  const [steps, setSteps] = useState<StepsState | null>(null);
  const [stepsLoading, setStepsLoading] = useState(true);

  const loadSteps = async () => {
    try {
      setStepsLoading(true);
      const res = await getStepsByComplaintId(complaintIdNum);
      console.log(res);
      const formatted = {} as StepsState;
      res.steps.forEach((s: any) => {
        formatted[s.step_code as StepCode] = { status: s.status as StepStatus };
      });

      setSteps(formatted);
    } catch (e) {
      console.error("Error loading steps:", e);
      setSteps(null);
    } finally {
      setStepsLoading(false);
    }
  };

  useEffect(() => {
    loadSteps();
  }, [complaintIdNum]);

  const Page = useMemo(() => {
    switch (stepCode) {
      case "D1":
        return <D1 onRefreshSteps={loadSteps} />;
      case "D2":
        return <D2 onRefreshSteps={loadSteps} />;
      case "D3":
        return <D3 onRefreshSteps={loadSteps} />;
      case "D4":
        return <D4 onRefreshSteps={loadSteps} />;
      case "D5":
        return <D5 onRefreshSteps={loadSteps} />;
      case "D6":
        return <D6 onRefreshSteps={loadSteps} />;
      case "D7":
        return <D7 onRefreshSteps={loadSteps} />;
      case "D8":
        return <D8 onRefreshSteps={loadSteps} />;
      default:
        return <D1 onRefreshSteps={loadSteps} />;
    }
  }, [stepCode]);

  // Calculate grid columns based on collapsed state
  const getGridColumns = () => {
    const sidebarWidth = sidebarCollapsed ? "60px" : "280px";
    const chatWidth = chatCollapsed ? "60px" : "360px";
    return `${sidebarWidth} 1fr ${chatWidth}`;
  };

  return (
    <div
      style={{ minHeight: "100vh", background: INDUSTRIAL_COLORS.background }}
    >
      <Toaster position="top-center" />

      <Topbar />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: getGridColumns(),
          gap: 0,
          minHeight: "calc(100vh - 64px)",
          transition: "grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            background: "white",
            borderRight: `1px solid ${INDUSTRIAL_COLORS.border}`,
            boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
            transition: "all 0.3s ease",
          }}
        >
          {stepsLoading ? (
            <div style={{ padding: 16 }}>
              {sidebarCollapsed ? "..." : "Loading steps..."}
            </div>
          ) : (
            <Sidebar
              steps={steps}
              isCollapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          )}
        </div>

        {/* Main Content */}
        <div
          style={{
            padding: 24,
            overflowY: "auto",
            background: INDUSTRIAL_COLORS.background,
            transition: "all 0.3s ease",
          }}
        >
          {/* Optional: Add expand buttons overlay when both panels are collapsed */}
          {sidebarCollapsed && chatCollapsed && (
            <div
              style={{
                position: "fixed",
                top: 80,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 100,
                display: "flex",
                gap: 12,
                padding: "12px 16px",
                background: "white",
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                border: `1px solid ${INDUSTRIAL_COLORS.border}`,
              }}
            >
              <button
                onClick={() => setSidebarCollapsed(false)}
                style={{
                  padding: "8px 16px",
                  background:
                    "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
                  border: "none",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                🗂️ Show Navigation
              </button>
              <button
                onClick={() => setChatCollapsed(false)}
                style={{
                  padding: "8px 16px",
                  background:
                    "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
                  border: "none",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                💬 Show AI Coach
              </button>
            </div>
          )}

          {Page}
        </div>

        {/* Chat Coach */}
        <div
          style={{
            background: "white",
            borderLeft: `1px solid ${INDUSTRIAL_COLORS.border}`,
            boxShadow: "-2px 0 8px rgba(0,0,0,0.05)",
            transition: "all 0.3s ease",
          }}
        >
          <ChatCoach
            step={stepCode}
            isCollapsed={chatCollapsed}
            onToggle={() => setChatCollapsed(!chatCollapsed)}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ComplaintsList />} />
      <Route path="/complaints" element={<ComplaintsList />} />
      <Route path="/complaints/new" element={<NewComplaint />} />

      <Route path="/8d/:complaintId/:step" element={<EightDShell />} />

      <Route path="/8d" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
