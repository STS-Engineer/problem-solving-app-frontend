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
import toast from "react-hot-toast";

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

// ─── Constants ───────────────────────────────────────────────────────────────
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

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Toast-based confirm helper ──────────────────────────────────────────────
/**
 * Shows an inline toast with Confirm / Cancel buttons.
 * Returns a Promise<boolean> — resolves true if the user clicks Confirm.
 */
function toastConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    toast(
      (t) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 220,
          }}
        >
          <span style={{ fontSize: 14, color: C.primary }}>{message}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              style={{
                flex: 1,
                padding: "5px 10px",
                background: C.danger,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Delete
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              style={{
                flex: 1,
                padding: "5px 10px",
                background: "#e0e0e0",
                color: C.primary,
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // stays until the user acts
        icon: "🗑️",
      },
    );
  });
}

// ─── Component ───────────────────────────────────────────────────────────────
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
      toast.error(`Could not delete "${sf.filename}": ${err.message}`);
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
      {/* ── Drop Zone ───────────────────────────────────────────────────── */}
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
        <div style={{ fontSize: 28, marginBottom: 6 }}>
          {isDragOver ? "📂" : "📎"}
        </div>
        <div style={{ fontSize: 14, color: C.primary, fontWeight: 500 }}>
          {isDragOver ? "Drop files here" : "Drag & drop evidence files"}
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
          or{" "}
          <span style={{ color: C.accent, fontWeight: 500 }}>
            click to browse
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginTop: 10,
          }}
        >
          {["🖼️ Images", "📄 PDF"].map((label) => (
            <span
              key={label}
              style={{
                fontSize: 11,
                background: "#E8EDF5",
                color: C.muted,
                borderRadius: 20,
                padding: "2px 10px",
              }}
            >
              {label}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
          Max {MAX_MB} MB per file
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
      </div>

      {/* ── In-progress / error chips ──────────────────────────────────── */}
      {uploading.map((u) => (
        <div
          key={u.localId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            background: u.error ? "rgba(231,76,60,0.07)" : "#F0F4FF",
            border: `1px solid ${u.error ? C.danger : C.accent}22`,
            borderRadius: 8,
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 16 }}>{u.error ? "⚠️" : "⏳"}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: C.primary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
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
                  background: "#dde4f5",
                  borderRadius: 4,
                  marginTop: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${u.progress}%`,
                    background: C.accent,
                    borderRadius: 4,
                    transition: "width 0.2s",
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

      {/* ── Confirmed file list ────────────────────────────────────────── */}
      {loadingList ? (
        <div style={{ padding: 12, color: C.muted, fontSize: 13 }}>
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

      {/* ── Image preview modal ────────────────────────────────────────── */}
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

// ─── FileChip ────────────────────────────────────────────────────────────────
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

  // ── Delete with toast confirm instead of window.confirm ──────────────────
  async function handleDeleteClick() {
    const confirmed = await toastConfirm(`Delete "${file.filename}"?`);
    if (!confirmed) return;
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        marginBottom: 6,
        boxShadow: "none",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Icon */}
      <div style={{ fontSize: 22, flexShrink: 0 }}>{file.icon}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: C.primary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file.filename}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
          {file.size_label} ·{" "}
          {new Date(file.uploaded_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Actions */}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        title="Download"
        style={{
          fontSize: 16,
          textDecoration: "none",
          padding: 4,
          color: C.muted,
        }}
      >
        🔗
      </a>
      {file.is_image && (
        <button
          onClick={onPreview}
          title="Preview"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            padding: 4,
            color: C.muted,
          }}
        >
          👁️
        </button>
      )}
      <button
        onClick={handleDeleteClick}
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
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
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
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <span>🖼️</span>
          <span
            style={{ flex: 1, fontSize: 14, fontWeight: 500, color: C.primary }}
          >
            {file.filename}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: C.accent, marginRight: 12 }}
          >
            Open full size ↗
          </a>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: C.muted,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Image */}
        <img
          src={url}
          alt={file.filename}
          style={{ maxWidth: "85vw", maxHeight: "75vh", objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
