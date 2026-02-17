// src/components/EvidenceUploader.tsx
/**
 * Drag-and-drop + click-to-browse evidence file uploader.
 * Accepts images (jpg, png, gif, webp, bmp, tiff) and PDFs only.
 * Files are uploaded immediately on selection and stored in the DB.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteStepFile,
  getFileDownloadUrl,
  listStepFiles,
  StepFileRecord,
  uploadStepFile,
} from "../services/api/stepFiles";

// ─── Design tokens (matches your app palette) ────────────────────────────────
const C = {
  accent: "#4A7CFF",
  success: "#27AE60",
  danger: "#E74C3C",
  warning: "#F39C12",
  border: "#BDC3C7",
  primary: "#2C3E50",
  muted: "#78909C",
  bgLight: "#F8F9FA",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCEPTED_MIME = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "application/pdf",
];
const ACCEPT_ATTR = ACCEPTED_MIME.join(",");
const MAX_MB = 25;
const MAX_BYTES = MAX_MB * 1024 * 1024;

// ─── Types ────────────────────────────────────────────────────────────────────
interface UploadingItem {
  localId: string;
  filename: string;
  progress: number; // 0-90 (simulated), 100 = done
  error?: string;
}

interface Props {
  stepId: number | null;
  /** Called whenever the confirmed file list changes */
  onChange?: (files: StepFileRecord[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EvidenceUploader({ stepId, onChange }: Props) {
  const [files, setFiles] = useState<StepFileRecord[]>([]);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<StepFileRecord | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load existing files on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!stepId) {
      setLoadingList(false);
      return;
    }
    listStepFiles(stepId)
      .then((f) => {
        setFiles(f);
        onChange?.(f);
      })
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, [stepId]);

  // ── Client-side validation ────────────────────────────────────────────────
  function validate(file: File): string | null {
    if (!ACCEPTED_MIME.includes(file.type)) {
      return "Only images (jpg, png, gif, webp, bmp, tiff) and PDFs are allowed.";
    }
    if (file.size > MAX_BYTES) {
      return `File exceeds ${MAX_MB} MB limit.`;
    }
    if (file.size === 0) {
      return "File is empty.";
    }
    return null;
  }

  // ── Upload handler ────────────────────────────────────────────────────────
  const processFiles = useCallback(
    async (raw: FileList | File[]) => {
      if (!stepId) return;

      for (const file of Array.from(raw)) {
        const validationError = validate(file);
        const localId = crypto.randomUUID();

        if (validationError) {
          // Show error chip, auto-dismiss after 5 s
          setUploading((p) => [
            ...p,
            {
              localId,
              filename: file.name,
              progress: 0,
              error: validationError,
            },
          ]);
          setTimeout(() => dismissUploading(localId), 5000);
          continue;
        }

        // Add progress placeholder
        setUploading((p) => [
          ...p,
          { localId, filename: file.name, progress: 0 },
        ]);

        // Simulate progress while waiting for server
        const ticker = setInterval(() => {
          setUploading((p) =>
            p.map((u) =>
              u.localId === localId && !u.error
                ? { ...u, progress: Math.min(u.progress + 15, 88) }
                : u,
            ),
          );
        }, 220);

        try {
          const saved = await uploadStepFile(stepId, file);
          clearInterval(ticker);
          setUploading((p) => p.filter((u) => u.localId !== localId));
          setFiles((prev) => {
            const next = [...prev, saved];
            onChange?.(next);
            return next;
          });
        } catch (err: any) {
          clearInterval(ticker);
          setUploading((p) =>
            p.map((u) =>
              u.localId === localId
                ? { ...u, progress: 0, error: err.message }
                : u,
            ),
          );
          setTimeout(() => dismissUploading(localId), 7000);
        }
      }
    },
    [stepId],
  );

  function dismissUploading(localId: string) {
    setUploading((p) => p.filter((u) => u.localId !== localId));
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(sf: StepFileRecord) {
    if (!stepId) return;
    try {
      await deleteStepFile(stepId, sf.id);
      setFiles((prev) => {
        const next = prev.filter((f) => f.id !== sf.id);
        onChange?.(next);
        return next;
      });
    } catch (err: any) {
      alert(`Could not delete "${sf.filename}": ${err.message}`);
    }
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }
  function onDragLeave() {
    setIsDragOver(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  }

  const hasItems = files.length > 0 || uploading.length > 0;

  return (
    <div>
      {/* ── Drop Zone ─────────────────────────────────────────────────────── */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${isDragOver ? C.accent : C.border}`,
          borderRadius: 12,
          padding: "24px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: isDragOver ? "rgba(74,124,255,0.06)" : C.bgLight,
          transition: "all 0.2s ease",
          marginBottom: hasItems ? 14 : 0,
          userSelect: "none",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>
          {isDragOver ? "📂" : "📎"}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.primary,
            marginBottom: 4,
          }}
        >
          {isDragOver ? "Drop files here" : "Drag & drop evidence files"}
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
          or{" "}
          <span style={{ color: C.accent, fontWeight: 600 }}>
            click to browse
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {["🖼️ Images", "📄 PDF"].map((label) => (
            <span
              key={label}
              style={{
                padding: "3px 10px",
                background: "white",
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                fontSize: 11,
                color: C.muted,
                fontWeight: 500,
              }}
            >
              {label}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "#B0BEC5", marginTop: 6 }}>
          Max {MAX_MB} MB per file
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* ── In-progress / error chips ─────────────────────────────────────── */}
      {uploading.map((u) => (
        <div
          key={u.localId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            background: u.error
              ? "rgba(231,76,60,0.05)"
              : "rgba(74,124,255,0.05)",
            border: `1px solid ${u.error ? C.danger : C.accent}`,
            borderRadius: 10,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 18 }}>{u.error ? "⚠️" : "⏳"}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.primary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {u.filename}
            </div>
            {u.error ? (
              <div style={{ fontSize: 11, color: C.danger, marginTop: 2 }}>
                {u.error}
              </div>
            ) : (
              <div
                style={{
                  height: 4,
                  background: "#E8EAF6",
                  borderRadius: 4,
                  marginTop: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${u.progress}%`,
                    background: `linear-gradient(90deg, ${C.accent}, ${C.success})`,
                    borderRadius: 4,
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            )}
          </div>
          {u.error && (
            <button
              onClick={() => dismissUploading(u.localId)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.muted,
                fontSize: 16,
                padding: 4,
              }}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {/* ── Confirmed file list ───────────────────────────────────────────── */}
      {loadingList ? (
        <div style={{ fontSize: 12, color: C.muted, padding: "6px 0" }}>
          Loading files…
        </div>
      ) : (
        files.map((f) => (
          <FileChip
            key={f.id}
            file={f}
            stepId={stepId!}
            onDelete={() => handleDelete(f)}
            onPreview={() => f.is_image && setPreview(f)}
          />
        ))
      )}

      {/* ── Image preview modal ───────────────────────────────────────────── */}
      {preview && (
        <PreviewModal
          file={preview}
          stepId={stepId!}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}

// ─── FileChip ─────────────────────────────────────────────────────────────────
function FileChip({
  file,
  stepId,
  onDelete,
  onPreview,
}: {
  file: StepFileRecord;
  stepId: number;
  onDelete: () => Promise<void>;
  onPreview: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const url = getFileDownloadUrl(stepId, file.id);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        background: "white",
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        marginBottom: 8,
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Icon */}
      <div
        onClick={file.is_image ? onPreview : undefined}
        title={file.is_image ? "Click to preview" : undefined}
        style={{
          width: 40,
          height: 40,
          background: "rgba(74,124,255,0.08)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          cursor: file.is_image ? "zoom-in" : "default",
          flexShrink: 0,
        }}
      >
        {file.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.primary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={file.filename}
        >
          {file.filename}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
          {file.size_label} ·{" "}
          {new Date(file.uploaded_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          title={
            file.mime_type === "application/pdf" ? "Open PDF" : "Open image"
          }
          style={{
            width: 30,
            height: 30,
            background: "rgba(74,124,255,0.1)",
            border: "none",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          🔗
        </a>
        <button
          onClick={async () => {
            if (!confirm(`Delete "${file.filename}"?`)) return;
            setDeleting(true);
            await onDelete();
            setDeleting(false);
          }}
          disabled={deleting}
          title="Delete file"
          style={{
            width: 30,
            height: 30,
            background: deleting ? "#E0E0E0" : "rgba(231,76,60,0.1)",
            border: "none",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            cursor: deleting ? "not-allowed" : "pointer",
            color: C.danger,
          }}
        >
          {deleting ? "…" : "🗑️"}
        </button>
      </div>
    </div>
  );
}

// ─── PreviewModal ─────────────────────────────────────────────────────────────
function PreviewModal({
  file,
  stepId,
  onClose,
}: {
  file: StepFileRecord;
  stepId: number;
  onClose: () => void;
}) {
  const url = getFileDownloadUrl(stepId, file.id);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 16,
          overflow: "hidden",
          maxWidth: "90vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>
            🖼️ {file.filename}
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 12,
                color: C.accent,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Open full size ↗
            </a>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: C.muted,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>
        {/* Image */}
        <div style={{ overflow: "auto" }}>
          <img
            src={url}
            alt={file.filename}
            style={{
              display: "block",
              maxWidth: "85vw",
              maxHeight: "80vh",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </div>
  );
}
