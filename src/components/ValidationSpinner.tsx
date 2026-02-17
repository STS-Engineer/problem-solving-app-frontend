// src/components/ValidationSpinner.tsx
import { useEffect, useState } from "react";

interface ValidationSpinnerProps {
  stepCode: string;
}

const MESSAGES = [
  "Analyzing your data against 8D standards…",
  "Checking completeness and quality…",
  "Cross-referencing with knowledge base…",
  "Running rules validation…",
  "Preparing feedback…",
];

export default function ValidationSpinner({
  stepCode,
}: ValidationSpinnerProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState(0);

  // Cycle through progress messages so the user knows it's alive
  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(msgTimer);
  }, []);

  // Animated dots
  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 400);
    return () => clearInterval(dotTimer);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 32,
        padding: 48,
      }}
    >
      {/* Pulsing ring spinner */}
      <div style={{ position: "relative", width: 96, height: 96 }}>
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "4px solid #E8EAF6",
          }}
        />
        {/* Spinning arc */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "4px solid transparent",
            borderTopColor: "#4A7CFF",
            borderRightColor: "#4A7CFF",
            animation: "spin 0.9s linear infinite",
          }}
        />
        {/* Inner pulse */}
        <div
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4A7CFF22 0%, #2C5FE022 100%)",
            animation: "pulse 1.8s ease-in-out infinite",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          🤖
        </div>
      </div>

      {/* Step badge */}
      <div
        style={{
          padding: "6px 18px",
          background: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
          borderRadius: 20,
          color: "white",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.5px",
        }}
      >
        Validating {stepCode}
      </div>

      {/* Progress message */}
      <div
        style={{
          textAlign: "center",
          maxWidth: 360,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#2C3E50",
            marginBottom: 8,
            minHeight: 48,
            transition: "opacity 0.3s ease",
          }}
        >
          {MESSAGES[msgIndex]}
          {".".repeat(dots)}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#78909C",
          }}
        >
          AI validation in progress — this usually takes 5–15 seconds
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 300,
          height: 4,
          background: "#E8EAF6",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #4A7CFF 0%, #27AE60 100%)",
            borderRadius: 4,
            animation: "progressBar 12s ease-out forwards",
            width: "0%",
          }}
        />
      </div>

      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes progressBar {
          0%   { width: 0%; }
          20%  { width: 30%; }
          50%  { width: 55%; }
          80%  { width: 78%; }
          100% { width: 92%; }
        }
      `}</style>
    </div>
  );
}
