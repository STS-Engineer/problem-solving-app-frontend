import React from "react";

type AppHeaderProps = {
  title: string;
  logoSrc: string;
  actions?: React.ReactNode;
  primaryColor?: string;
  padding?: string;
};

export default function AppHeader({
  title,
  logoSrc,
  actions,
  primaryColor = "#2C3E50",
  padding = "32px 40px",
}: AppHeaderProps) {
  return (
    <div
      style={{
        background: primaryColor,
        borderRadius: 16,
        padding,
        marginBottom: 24,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* same right gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "40%",
          height: "100%",
          background:
            "linear-gradient(135deg, rgba(74, 124, 255, 0.1) 0%, transparent 100%)",
        }}
      />

      {/* responsive row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Left block */}
        <div style={{ flex: "1 1 420px", minWidth: 260 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <img
              src={logoSrc}
              alt="AVOCarbon Logo"
              style={{
                height: 60,
                width: "auto",
                objectFit: "contain",
                background: "white",
                padding: 6,
                borderRadius: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                flex: "0 0 auto",
              }}
            />

            <div
              style={{
                width: 4,
                height: 40,
                background: "linear-gradient(180deg, #4A7CFF 0%, #2C5FE0 100%)",
                borderRadius: 2,
                flex: "0 0 auto",
              }}
            />

            <h1
              style={{
                fontSize: 36,
                fontWeight: 800,
                margin: 0,
                color: "white",
                letterSpacing: "-0.5px",
                lineHeight: 1.1,
                wordBreak: "break-word",
                flex: "1 1 260px",
              }}
            >
              {title}
            </h1>
          </div>
        </div>

        {/* Right actions */}
        {actions && (
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              alignItems: "center",
              flex: "1 1 260px",
              minWidth: 240,
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
