import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo-avocarbon.png";
import AppHeader from "../components/AppHeader";
import Pagination from "./Pagination";
import { getCurrentStepByComplaint } from "../services/api/reports";
import { getComplaints } from "../services/api/complaint";

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
};

type ComplaintApi = {
  reference_number: string;
  id: number;
  complaint_name: string;
  quality_issue_warranty?: string | null; // C1/C2/...
  customer?: string | null;
  customer_plant_name?: string | null;
  avocarbon_plant?: string | null;
  avocarbon_product_type?: string | null;
  potential_avocarbon_process_linked_to_problem?: string | null;
  product_line?: string | null;
  concerned_application?: string | null;
  customer_complaint_date?: string | null; // YYYY-MM-DD
  complaint_opening_date?: string | null; // YYYY-MM-DD
  complaint_description?: string | null;
  defects?: string | null;
  quality_manager?: number | null;
  repetitive_complete_with_number?: string | null;
  assigned_to?: number | null;
  status: string;
  reported_by: number;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
};

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = () => setMatches(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [query]);

  return matches;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

function getStatusBadge(status: string) {
  const s = (status || "").trim().toUpperCase();

  // draft badge
  if (s === "DRAFT") {
    return {
      text: "Brouillon",
      bg: "rgba(189, 195, 199, 0.15)",
      border: INDUSTRIAL_COLORS.border,
      color: INDUSTRIAL_COLORS.secondary,
    };
  }

  // step badge
  const stepSet = new Set(["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"]);
  if (stepSet.has(s)) {
    return {
      text: `8D ${s}`,
      bg: "rgba(74, 124, 255, 0.10)",
      border: INDUSTRIAL_COLORS.accent,
      color: INDUSTRIAL_COLORS.accent,
    };
  }

  // fallback for anything else
  return {
    text: status || "—",
    bg: "rgba(189, 195, 199, 0.10)",
    border: INDUSTRIAL_COLORS.border,
    color: INDUSTRIAL_COLORS.secondary,
  };
}

function deriveStepAndProgress(status: string) {
  const s = (status || "").trim().toUpperCase();

  // draft = no step filled
  if (s === "DRAFT") return { step: "—", progress: 0 };

  const stepProgress: Record<string, number> = {
    D1: 12.5,
    D2: 25,
    D3: 37.5,
    D4: 50,
    D5: 62.5,
    D6: 75,
    D7: 87.5,
    D8: 100,
  };

  if (s in stepProgress) return { step: s, progress: stepProgress[s] };

  // fallback if something unexpected
  return { step: "—", progress: 0 };
}

function getWarrantyBadgeStyle(code?: string | null) {
  const c = (code || "").toUpperCase().trim();

  if (c === "C1") {
    return {
      bg: "rgba(231, 76, 60, 0.12)",
      border: `2px solid ${INDUSTRIAL_COLORS.danger}`,
      color: INDUSTRIAL_COLORS.danger,
    };
  }
  if (c === "C2") {
    return {
      bg: "rgba(243, 156, 18, 0.12)",
      border: `2px solid ${INDUSTRIAL_COLORS.warning}`,
      color: INDUSTRIAL_COLORS.warning,
    };
  }

  // Default (C3, C4, etc.)
  return {
    bg: "rgba(52, 152, 219, 0.12)",
    border: `2px solid ${INDUSTRIAL_COLORS.info}`,
    color: INDUSTRIAL_COLORS.info,
  };
}

export default function ComplaintsList() {
  const isSmall = useMediaQuery("(max-width: 900px)");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productLineFilter, setProductLineFilter] = useState("all");

  const [data, setData] = useState<ComplaintApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleOpen8D = async (complaintId: number) => {
    try {
      setRedirecting(complaintId);

      // Récupérer l'étape courante
      const currentStep = await getCurrentStepByComplaint(complaintId);

      // Rediriger vers l'étape courante
      navigate(`/8d/${complaintId}/${currentStep.current_step_code}`);
    } catch (error: any) {
      console.error("Erreur:", error);
      alert("❌ " + error.message);
      setRedirecting(null);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const json = (await getComplaints(
          {
            skip: 0,
            limit: 200,
            status: statusFilter !== "all" ? statusFilter : undefined,
            product_line:
              productLineFilter !== "all" ? productLineFilter : undefined,
          },
          controller.signal,
        )) as ComplaintApi[];

        setData(Array.isArray(json) ? json : []);
      } catch (e: any) {
        if (
          e?.name === "CanceledError" ||
          e?.code === "ERR_CANCELED" ||
          e?.name === "AbortError"
        )
          return;

        setErrorMsg(
          e?.message || "Erreur lors du chargement des réclamations.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [statusFilter, productLineFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, productLineFilter]);

  const productLineOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of data) if (c.product_line) set.add(c.product_line);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const filteredComplaints = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return data;

    return data.filter((c) => {
      const haystack = [
        c.id?.toString(),
        c.complaint_name,
        c.customer,
        c.customer_plant_name,
        c.avocarbon_plant,
        c.avocarbon_product_type,
        c.product_line,
        c.concerned_application,
        c.potential_avocarbon_process_linked_to_problem,
        c.defects,
        c.quality_issue_warranty,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [data, searchTerm]);

  const total = filteredComplaints.length;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedComplaints = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredComplaints.slice(start, start + pageSize);
  }, [filteredComplaints, safePage, pageSize]);

  const stats = useMemo(() => {
    const total = data.length;
    const open = data.filter(
      (c) => (c.status || "").toLowerCase() === "open",
    ).length;
    const inProgress = data.filter((c) =>
      (c.status || "").toLowerCase().startsWith("d"),
    ).length;
    const closed = data.filter(
      (c) => (c.status || "").toLowerCase() === "closed",
    ).length;
    const rejected = data.filter(
      (c) => (c.status || "").toLowerCase() === "rejected",
    ).length;
    return { total, open, inProgress, closed, rejected };
  }, [data]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E8EAF6 0%, #F5F7FA 100%)",
        padding: 24,
      }}
    >
      <AppHeader
        title="Customer Complaint Tracking
"
        logoSrc={logo}
        actions={
          <>
            <Link
              to="/complaints/new"
              style={{
                background: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
                color: "white",
                padding: "12px 18px",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 14,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(74, 124, 255, 0.25)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 16 }}>➕</span>
              New complaint
            </Link>
          </>
        }
      />

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Total", value: stats.total, icon: "📊" },
          { label: "Open", value: stats.open, icon: "📌" },
          { label: "In Progress", value: stats.inProgress, icon: "⏳" },
          { label: "Closed", value: stats.closed, icon: "✅" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "white",
              borderRadius: 16,
              padding: 22,
              boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
              border: "1px solid #E6E6E6",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  background:
                    "linear-gradient(135deg, #2C3E50 0%, #34495E 100%)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {s.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#78909C",
                    marginBottom: 4,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 900,
                    color: INDUSTRIAL_COLORS.primary,
                  }}
                >
                  {s.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #E0E0E0",
          overflow: "hidden",
        }}
      >
        {/* Filters */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `3px solid ${INDUSTRIAL_COLORS.accent}`,
            background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
                borderRadius: 12,
              }}
            />
            <div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  margin: 0,
                  color: INDUSTRIAL_COLORS.primary,
                }}
              >
                Search & Filtres
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#78909C",
                  margin: "3px 0 0 0",
                  fontWeight: 700,
                }}
              >
                {loading ? "Loading..." : "Refine your results"}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isSmall ? "1fr" : "2fr 1fr 1fr",
              gap: 14,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#78909C",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Search
              </label>
              <input
                type="text"
                placeholder="Name, Client, plant, product line, defects, C1/C2..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#78909C",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 900,
                  outline: "none",
                  cursor: "pointer",
                  background: "white",
                }}
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#78909C",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Product line
              </label>
              <select
                value={productLineFilter}
                onChange={(e) => setProductLineFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 900,
                  outline: "none",
                  cursor: "pointer",
                  background: "white",
                }}
              >
                <option value="all">All</option>
                {productLineOptions.map((pl) => (
                  <option key={pl} value={pl}>
                    {pl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && (
            <div
              style={{
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(231, 76, 60, 0.08)",
                border: `1px solid ${INDUSTRIAL_COLORS.danger}`,
                color: INDUSTRIAL_COLORS.danger,
                fontWeight: 900,
                fontSize: 13,
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Results */}
        <div style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: isSmall ? "flex-start" : "center",
              gap: 12,
              marginBottom: 16,
              flexDirection: isSmall ? "column" : "row",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 900,
                margin: 0,
                color: INDUSTRIAL_COLORS.primary,
              }}
            >
              Results{" "}
              <span style={{ fontSize: 13, fontWeight: 800, color: "#78909C" }}>
                ({filteredComplaints.length} complaint
                {filteredComplaints.length > 1 ? "s" : ""})
              </span>
            </h3>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: 1050,
              }}
            >
              <thead>
                <tr>
                  {[
                    { text: "ID / Complaint", color: "#4A7CFF" },
                    { text: "Client", color: "#27AE60" },
                    { text: "AVOCarbon", color: "#9B59B6" },
                    { text: "Product", color: "#3498DB" },
                    { text: "Process", color: "#34495E" },
                    { text: "Defects", color: "#E74C3C" },
                    { text: "Status / 8D", color: "#1A1A1A" },
                    { text: "Actions", color: "#2C3E50" },
                  ]
                    .filter((c) => {
                      // Responsive: on masque AVOCarbon sur petit écran
                      if (isSmall && c.text === "AVOCarbon") return false;
                      return true;
                    })
                    .map((col, idx) => (
                      <th
                        key={idx}
                        style={{
                          padding: "14px 16px",
                          background: `linear-gradient(135deg, ${col.color}15 0%, ${col.color}05 100%)`,
                          borderBottom: `3px solid ${col.color}`,
                          fontSize: 12,
                          fontWeight: 900,
                          color: INDUSTRIAL_COLORS.primary,
                          textAlign: "left",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col.text}
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={isSmall ? 7 : 8}
                      style={{ padding: 18, color: "#78909C", fontWeight: 800 }}
                    >
                      Loading complaints…
                    </td>
                  </tr>
                )}

                {!loading &&
                  paginatedComplaints.map((complaint) => {
                    const statusBadge = getStatusBadge(complaint.status);
                    const { step, progress } = deriveStepAndProgress(
                      complaint.status,
                    );
                    const isRedirecting = redirecting === complaint.id;

                    return (
                      <tr
                        key={complaint.id}
                        style={{
                          borderBottom: "1px solid #EAEAEA",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(74, 124, 255, 0.03)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {/* ID / Complaint */}
                        <td style={{ padding: "16px" }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 900,
                              color: INDUSTRIAL_COLORS.accent,
                            }}
                          >
                            #{complaint.reference_number}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 900,
                              color: INDUSTRIAL_COLORS.primary,
                              marginTop: 6,
                            }}
                          >
                            {complaint.complaint_name}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#78909C",
                              marginTop: 6,
                              fontWeight: 700,
                            }}
                          >
                            Opening:{" "}
                            {formatDate(complaint.complaint_opening_date)} ·
                            Customer:{" "}
                            {formatDate(complaint.customer_complaint_date)}
                          </div>
                        </td>

                        {/* Client */}
                        <td style={{ padding: "16px" }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 900,
                              color: INDUSTRIAL_COLORS.primary,
                            }}
                          >
                            {complaint.customer ?? "—"}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#78909C",
                              marginTop: 6,
                              fontWeight: 400,
                            }}
                          >
                            {complaint.customer_plant_name ?? "—"}
                          </div>
                        </td>

                        {/* AVOCarbon (maskable) */}
                        {!isSmall && (
                          <td style={{ padding: "16px" }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: INDUSTRIAL_COLORS.primary,
                              }}
                            >
                              {complaint.avocarbon_plant ?? "—"}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#78909C",
                                marginTop: 6,
                                fontWeight: 700,
                              }}
                            >
                              Type: {complaint.avocarbon_product_type ?? "—"}
                            </div>
                          </td>
                        )}

                        {/* Produit */}
                        <td style={{ padding: "16px" }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: INDUSTRIAL_COLORS.primary,
                            }}
                          >
                            {complaint.product_line ?? "—"}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#78909C",
                              marginTop: 6,
                              fontWeight: 700,
                            }}
                          >
                            App: {complaint.concerned_application ?? "—"}
                          </div>
                        </td>

                        {/* Process */}
                        <td style={{ padding: "16px" }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: INDUSTRIAL_COLORS.primary,
                            }}
                          >
                            {complaint.potential_avocarbon_process_linked_to_problem ??
                              "—"}
                          </div>
                        </td>

                        {/* Défauts = defects + badge quality_issue_warranty (C2 etc) */}
                        <td style={{ padding: "16px" }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: INDUSTRIAL_COLORS.primary,
                              }}
                            >
                              {complaint.defects ?? "—"}
                            </div>

                            {complaint.quality_issue_warranty && (
                              <span
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: 20,
                                  fontSize: 12,
                                  fontWeight: 900,
                                  width: "fit-content",
                                  ...getWarrantyBadgeStyle(
                                    complaint.quality_issue_warranty,
                                  ),
                                }}
                              >
                                {complaint.quality_issue_warranty}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Statut / 8D */}
                        <td style={{ padding: "16px" }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                            }}
                          >
                            <span
                              style={{
                                padding: "6px 12px",
                                background: statusBadge.bg,
                                border: `2px solid ${statusBadge.border}`,
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 900,
                                color: statusBadge.color,
                                width: "fit-content",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {statusBadge.text}
                            </span>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  flex: 1,
                                  height: 8,
                                  background: "#E6E6E6",
                                  borderRadius: 20,
                                  overflow: "hidden",
                                  minWidth: 120,
                                }}
                              >
                                <div
                                  style={{
                                    width: `${Math.max(0, Math.min(100, progress))}%`,
                                    height: "100%",
                                    background:
                                      (complaint.status || "").toLowerCase() ===
                                      "closed"
                                        ? "linear-gradient(90deg, #27AE60 0%, #1E8449 100%)"
                                        : "linear-gradient(90deg, #4A7CFF 0%, #2C5FE0 100%)",
                                    transition: "width 0.3s ease",
                                  }}
                                />
                              </div>

                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 900,
                                  color: INDUSTRIAL_COLORS.accent,
                                  minWidth: 34,
                                }}
                              >
                                {step}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "16px" }}>
                          <button
                            onClick={() => handleOpen8D(complaint.id)}
                            disabled={isRedirecting}
                            style={{
                              background: isRedirecting
                                ? "#BDC3C7"
                                : "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
                              color: "white",
                              padding: "10px 14px",
                              borderRadius: 10,
                              fontSize: 13,
                              fontWeight: 900,
                              border: "none",
                              cursor: isRedirecting ? "not-allowed" : "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              boxShadow: "0 2px 8px rgba(74, 124, 255, 0.25)",
                              transition: "all 0.2s ease",
                              whiteSpace: "nowrap",
                              opacity: isRedirecting ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!isRedirecting) {
                                e.currentTarget.style.transform =
                                  "translateY(-2px)";
                                e.currentTarget.style.boxShadow =
                                  "0 6px 14px rgba(74, 124, 255, 0.32)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isRedirecting) {
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                  "0 2px 8px rgba(74, 124, 255, 0.25)";
                              }
                            }}
                          >
                            <span>{isRedirecting ? "⏳" : "📂"}</span>
                            {isRedirecting ? "Loading..." : "Open 8D"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            <Pagination
              page={safePage}
              pageSize={pageSize}
              total={total}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
            />
          </div>

          {!loading && filteredComplaints.length === 0 && (
            <div style={{ padding: "64px 0", textAlign: "center" }}>
              <div style={{ fontSize: 58, marginBottom: 16 }}>🔍</div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: INDUSTRIAL_COLORS.primary,
                  marginBottom: 6,
                }}
              >
                No result
              </h3>
              <p style={{ fontSize: 14, color: "#78909C", fontWeight: 800 }}>
                No complaints match your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
