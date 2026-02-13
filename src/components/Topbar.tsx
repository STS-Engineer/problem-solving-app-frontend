import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/images/logo-avocarbon.png";
import { getComplaintById } from "../services/api/complaint";

const INDUSTRIAL_COLORS = {
  primary: "#2C3E50",
  accent: "#4A7CFF",
};

export default function Topbar() {
  const { complaintId } = useParams();
  const [complaint, setComplaint] = useState<any>(null);

  useEffect(() => {
    if (!complaintId) return;

    getComplaintById(Number(complaintId))
      .then(setComplaint)
      .catch((err) => console.error(err));
  }, [complaintId]);

  return (
    <header
      style={{
        height: 64,
        background: INDUSTRIAL_COLORS.primary,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <img
            src={logo}
            alt="AVOCarbon Logo"
            style={{
              width: 45,
              height: 45,
              objectFit: "contain",
              borderRadius: 8,
              background: "white",
              padding: 4,
            }}
          />

          <div>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: 0,
                color: "white",
              }}
            >
              8D Problem Solving Report
            </h1>

            <p
              style={{
                fontSize: 12,
                color: "#B0BEC5",
                margin: 0,
                fontWeight: 500,
              }}
            >
              {complaint
                ? `Complaint #${complaint.reference_number} · ${complaint.customer} · ${complaint.product_line}`
                : "No complaint selected"}
            </p>
          </div>
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              background: "#27AE60",
              borderRadius: "50%",
              boxShadow: "0 0 8px rgba(39, 174, 96, 0.5)",
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "white",
            }}
          >
            Quality Manager
          </span>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            border: "2px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          title="User Profile"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          👤
        </div>
      </div>
    </header>
  );
}
