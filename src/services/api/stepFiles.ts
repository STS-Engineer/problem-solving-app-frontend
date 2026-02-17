// src/services/api/stepFiles.ts

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/** Matches the _serialize() shape returned by the backend */
export interface StepFileRecord {
  id: number;          // step_files.id  ← use this for delete/download URLs
  file_id: number;     // files.id
  filename: string;    // original_name
  mime_type: string;
  size_bytes: number;
  size_label: string;  // "1.2 MB" — formatted by backend
  icon: string;        // emoji: 🖼️ | 📄
  is_image: boolean;
  uploaded_at: string; // ISO string
  checksum: string;
}

/** Upload one file. Returns the new StepFileRecord. */
export async function uploadStepFile(
  stepId: number,
  file: File,
): Promise<StepFileRecord> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}/api/v1/steps/${stepId}/files`, {
    method: "POST",
    body: form,
    // ⚠️ Do NOT set Content-Type — browser sets it with the multipart boundary
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Upload failed (${res.status})`);
  }
  return res.json();
}

/** List all evidence files for a step. */
export async function listStepFiles(stepId: number): Promise<StepFileRecord[]> {
  const res = await fetch(`${API_URL}/api/v1/steps/${stepId}/files`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load files");
  }
  return res.json();
}

/**
 * Delete a file by step_file_id (step_files.id — NOT files.id).
 * The backend deletes both the join row and the file record + disk file.
 */
export async function deleteStepFile(
  stepId: number,
  stepFileId: number,
): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/v1/steps/${stepId}/files/${stepFileId}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete file");
  }
}

/** URL to open / download a file (opens inline for images + PDFs). */
export function getFileDownloadUrl(stepId: number, stepFileId: number): string {
  return `${API_URL}/api/v1/steps/${stepId}/files/${stepFileId}/download`;
}