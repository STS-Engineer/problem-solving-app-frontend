// src/pages/StepLayout.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StepMeta, STEPS } from "../lib/steps";

const INDUSTRIAL_COLORS = {
  primary: "#2C3E50",
  accent: "#4A7CFF",
  success: "#27AE60",
  border: "#BDC3C7",
};

interface StepLayoutProps {
  meta: StepMeta;
  children: React.ReactNode;
  onSaveDraft: () => void;
  onSubmit: () => void;
  saving: boolean;
  hideFooter?: boolean; // ← NEW
}

export default function StepLayout({
  meta,
  children,
  onSaveDraft,
  onSubmit,
  saving,
  hideFooter = false, // ← NEW
}: StepLayoutProps) {
  const navigate = useNavigate();
  const { complaintId } = useParams<{ complaintId: string }>();

  const currentIndex = STEPS.findIndex((s) => s.code === meta.code);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < STEPS.length - 1;

  const handlePrevious = () => {
    if (hasPrevious)
      navigate(`/8d/${complaintId}/${STEPS[currentIndex - 1].code}`);
  };
  const handleNext = () => {
    if (hasNext) navigate(`/8d/${complaintId}/${STEPS[currentIndex + 1].code}`);
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #E0E0E0",
        overflow: "hidden",
        height: "fit-content",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "28px 32px",
          borderBottom: `3px solid ${INDUSTRIAL_COLORS.accent}`,
          background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                background: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                color: "white",
                boxShadow: "0 4px 12px rgba(74, 124, 255, 0.3)",
              }}
            >
              {meta.code}
            </div>
            <div>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  margin: "0 0 6px 0",
                  color: INDUSTRIAL_COLORS.primary,
                }}
              >
                {meta.title}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "#78909C",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {meta.subtitle}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handlePrevious}
              disabled={!hasPrevious}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: hasPrevious
                  ? "linear-gradient(135deg, #BDC3C7 0%, #95A5A6 100%)"
                  : "#E0E0E0",
                color: hasPrevious ? "white" : "#B0BEC5",
                fontSize: 13,
                fontWeight: 600,
                cursor: hasPrevious ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>←</span>
              <span>Previous Step</span>
            </button>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: hasNext
                  ? "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)"
                  : "#E0E0E0",
                color: hasNext ? "white" : "#B0BEC5",
                fontSize: 13,
                fontWeight: 600,
                cursor: hasNext ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>Next Step</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 32 }}>{children}</div>

      {/* Footer — Save Draft always visible; Submit hidden when hideFooter=true */}
      <div
        style={{
          padding: "20px 32px",
          borderTop: "1px solid #E0E0E0",
          background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onSaveDraft}
            disabled={saving}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #BDC3C7 0%, #95A5A6 100%)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: saving ? 0.6 : 1,
            }}
          >
            <span>💾</span>
            <span>{saving ? "Saving..." : "Save Draft"}</span>
          </button>

          {!hideFooter && (
            <button
              onClick={onSubmit}
              disabled={saving}
              style={{
                padding: "12px 28px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #27AE60 0%, #1E8449 100%)",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: saving ? 0.6 : 1,
              }}
            >
              <span>✅</span>
              <span>{saving ? "Submitting..." : "Validate & Save"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
