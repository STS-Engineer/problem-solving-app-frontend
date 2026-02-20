// src/services/api/reports.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  decision: "pass" | "fail";
  missing_fields: string[];
  incomplete_fields: string[];
  quality_issues: string[];
  rules_violations: string[];
  suggestions: string[];
  field_improvements: Record<string, string>;
  overall_assessment: string;
  language_detected: string;
}

export interface SectionValidationResult {
  decision: 'pass' | 'fail';
  missing_fields: string[];
  quality_issues: string[];
  suggestions: string[];
  field_improvements: Record<string, string>;
  overall_assessment: string;
  validated_at: string | null;
}

export interface SubmitSectionResponse {
  success: boolean;
  step_id: number;
  section_key: string;
  validation: ValidationResult;
  all_sections_passed: boolean;
  passed_sections: string[];
  remaining_sections: string[];
}

export interface AllSectionValidationsResponse {
  step_id: number;
  sections: Record<string, SectionValidationResult>;
}

export interface SubmitStepResponse {
  success: boolean;
  step_id: number;
  status: string;
  validation: ValidationResult;
  message: string;
}

export interface StepData {
  id: number;
  report_id: number;
  step_code: string;
  step_name: string;
  status: "draft" | "submitted" | "validated" | "rejected";
  data: any;
  completed_by: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP PROGRESS & SUBMISSION
// ─────────────────────────────────────────────────────────────────────────────

export async function saveStepProgress(stepId: number, data: any): Promise<StepData> {
  const response = await fetch(`${API_URL}/api/v1/steps/${stepId}/save`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error saving step");
  }
  return response.json();
}

export async function submitStep(stepId: number): Promise<SubmitStepResponse> {
  const response = await fetch(`${API_URL}/api/v1/steps/${stepId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error submitting step");
  }
  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

export async function getStepValidation(stepId: number): Promise<ValidationResult> {
  const response = await fetch(`${API_URL}/api/v1/steps/${stepId}/validation`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Validation not found");
  }
  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export async function getStepByComplaintCode(
  complaintId: number,
  stepCode: string,
): Promise<StepData> {
  const response = await fetch(
    `${API_URL}/api/v1/steps/complaint/${complaintId}/step/${stepCode}`,
    { headers: { "Content-Type": "application/json" } },
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Step not found");
  }
  return response.json();
}

export async function getStepsSummaryByComplaintId(complaintId: number): Promise<StepData[]> {
  const res = await axios.get(`${API_URL}/api/v1/steps/complaint/${complaintId}/steps/summary`);
  return res.data as StepData[];
}

export async function getCurrentStepByComplaint(complaintId: number): Promise<StepData> {
  const response = await fetch(
    `${API_URL}/api/v1/reports/complaint/${complaintId}/current-step`,
    { headers: { "Content-Type": "application/json" } },
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Current step not found");
  }
  return response.json();
}

/**
 * BUG FIX: The backend returns { report_id: number, steps: StepData[] }
 * but the old code did `return res.data` which gave the whole object.
 * Calling .forEach() on an object throws "stepsArray.forEach is not a function".
 *
 * Fix: always extract res.data.steps (with a fallback in case the API ever
 * returns a bare array for backwards-compatibility).
 */
export async function getStepsByComplaintId(complaintId: number): Promise<StepData[]> {
  const res = await axios.get(`${API_URL}/api/v1/steps/complaint/${complaintId}/steps`);

  const payload = res.data;

  // Backend returns { report_id, steps: [...] }
  if (payload && Array.isArray(payload.steps)) {
    return payload.steps as StepData[];
  }

  // Fallback: bare array (shouldn't happen with current backend, but safe)
  if (Array.isArray(payload)) {
    return payload as StepData[];
  }

  // Unexpected shape — fail loudly so it's easy to debug
  console.error("getStepsByComplaintId: unexpected response shape", payload);
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function isStepValidated(step: StepData): boolean {
  return step.status === "validated";
}

export function isStepRejected(step: StepData): boolean {
  return step.status === "rejected";
}

export function didValidationPass(validation: ValidationResult): boolean {
  return validation.decision === "pass";
}

export function getTotalIssues(validation: ValidationResult): number {
  return (
    validation.missing_fields.length +
    validation.quality_issues.length +
    validation.rules_violations.length
  );
}

export function formatValidationSummary(validation: ValidationResult): string {
  if (validation.decision === "pass") {
    return "✅ All quality requirements met";
  }
  const issues = getTotalIssues(validation);
  return `⚠️ ${issues} issue${issues !== 1 ? "s" : ""} found`;
}

export async function submitSection(
  stepId: number,
  sectionKey: string,
): Promise<SubmitSectionResponse> {
  const response = await fetch(`${API_URL}/api/v1/steps/${stepId}/submit-section`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section_key: sectionKey }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Error submitting section");
  }
  return response.json();
}

export async function getSectionValidations(
  stepId: number,
): Promise<AllSectionValidationsResponse> {
  const response = await fetch(`${API_URL}/api/v1/steps/${stepId}/section-validations`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Section validations not found");
  }
  return response.json();
}