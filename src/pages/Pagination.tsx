import React, { useMemo } from "react";

type PaginationProps = {
  page: number; // 1-based
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  style?: React.CSSProperties;
};

function range(start: number, end: number) {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

// Pagination pro avec ellipses
function buildPages(page: number, totalPages: number) {
  if (totalPages <= 7) return range(1, totalPages);

  const pages: (number | "…")[] = [];
  const left = Math.max(2, page - 1);
  const right = Math.min(totalPages - 1, page + 1);

  pages.push(1);

  if (left > 2) pages.push("…");
  for (const p of range(left, right)) pages.push(p);
  if (right < totalPages - 1) pages.push("…");

  pages.push(totalPages);
  return pages;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100, 200],
  style,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pages = useMemo(
    () => buildPages(safePage, totalPages),
    [safePage, totalPages],
  );

  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(total, safePage * pageSize);

  const baseBtn: React.CSSProperties = {
    height: 36,
    padding: "0 12px",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    background: "#FFFFFF",
    fontSize: 13,
    fontWeight: 800,
    color: "#334155",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    transition:
      "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
    userSelect: "none",
  };

  const disabledBtn: React.CSSProperties = {
    ...baseBtn,
    cursor: "not-allowed",
    opacity: 0.55,
  };

  const pageBtn: React.CSSProperties = {
    ...baseBtn,
    minWidth: 36,
    padding: "0 12px",
  };

  const activePageBtn: React.CSSProperties = {
    ...pageBtn,
    background: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
    border: "1px solid rgba(74,124,255,0.35)",
    color: "#FFFFFF",
    boxShadow: "0 4px 12px rgba(74,124,255,0.25)",
  };

  const container: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    ...style,
  };

  const left: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  };

  const right: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  };

  const pill: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 800,
    color: "#64748B",
  };

  const select: React.CSSProperties = {
    height: 36,
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    padding: "0 10px",
    fontSize: 13,
    fontWeight: 800,
    color: "#334155",
    background: "#FFFFFF",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    cursor: "pointer",
  };

  return (
    <div style={container}>
      <div style={left}>
        <div style={pill}>
          {from}–{to} <span style={{ fontWeight: 600 }}>sur</span> {total}
        </div>

        {onPageSizeChange && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: "#94A3B8" }}>
              raws
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={select}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={right}>
        <button
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          style={safePage <= 1 ? disabledBtn : baseBtn}
          onMouseEnter={(e) => {
            if (safePage <= 1) return;
            (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 6px 14px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            if (safePage <= 1) return;
            (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 1px 2px rgba(0,0,0,0.06)";
          }}
        >
          ← Previous
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {pages.map((p, i) =>
            p === "…" ? (
              <span
                key={`dots-${i}`}
                style={{ padding: "0 6px", color: "#94A3B8", fontWeight: 900 }}
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                style={p === safePage ? activePageBtn : pageBtn}
                onMouseEnter={(e) => {
                  if (p === safePage) return;
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#F8FAFC";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(-1px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 6px 14px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  if (p === safePage) return;
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#FFFFFF";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 1px 2px rgba(0,0,0,0.06)";
                }}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          style={safePage >= totalPages ? disabledBtn : baseBtn}
          onMouseEnter={(e) => {
            if (safePage >= totalPages) return;
            (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 6px 14px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            if (safePage >= totalPages) return;
            (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 1px 2px rgba(0,0,0,0.06)";
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
