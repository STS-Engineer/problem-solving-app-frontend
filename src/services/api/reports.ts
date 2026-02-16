import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface ValidationResult {
  decision: 'pass' | 'fail';
  missing_fields: string[];
  incomplete_fields: string[];
  quality_issues: string[];
  rules_violations: string[];
  suggestions: string[];
  field_improvements: Record<string, string>;
  overall_assessment: string;
  language_detected: string;
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
  status: 'draft' | 'submitted' | 'validated' | 'rejected';
  data: any;
  completed_by: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// ============================================================
// STEP PROGRESS & SUBMISSION
// ============================================================

export async function saveStepProgress(stepId: number, data: any): Promise<StepData> {
  const response = await fetch(`${API_URL}/api/v1/steps/${stepId}/save`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error saving step');
  }

  return response.json();
}

export async function submitStep(stepId: number): Promise<SubmitStepResponse> {
  const response = await fetch(`${API_URL}/api/v1/steps/${stepId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error submitting step');
  }

  return response.json();
}

// ============================================================
// VALIDATION
// ============================================================

export async function getStepValidation(stepId: number): Promise<ValidationResult> {
  const response = await fetch(
    `${API_URL}/api/v1/steps/${stepId}/validation`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Validation not found');
  }

  return response.json();
}

// ============================================================
// STEP QUERIES
// ============================================================

export async function getStepByComplaintCode(
  complaintId: number, 
  stepCode: string
): Promise<StepData> {
  const response = await fetch(
    `${API_URL}/api/v1/steps/complaint/${complaintId}/step/${stepCode}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Step not found');
  }

  return response.json();
}

export async function getCurrentStepByComplaint(complaintId: number): Promise<StepData> {
  const response = await fetch(
    `${API_URL}/api/v1/reports/complaint/${complaintId}/current-step`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Current step not found');
  }

  return response.json();
}


export async function getStepsByComplaintId(complaintId: number): Promise<StepData[]> {
  const res = await axios.get(`${API_URL}/api/v1/steps/complaint/${complaintId}/steps`);
  // Return the data directly, not res.data.steps
  return res.data;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Check if a step has been validated
 */
export function isStepValidated(step: StepData): boolean {
  return step.status === 'validated';
}

/**
 * Check if a step has been rejected
 */
export function isStepRejected(step: StepData): boolean {
  return step.status === 'rejected';
}

/**
 * Check if validation passed
 */
export function didValidationPass(validation: ValidationResult): boolean {
  return validation.decision === 'pass';
}

/**
 * Get total number of issues from validation
 */
export function getTotalIssues(validation: ValidationResult): number {
  return (
    validation.missing_fields.length +
    validation.quality_issues.length +
    validation.rules_violations.length
  );
}

/**
 * Format validation for display
 */
export function formatValidationSummary(validation: ValidationResult): string {
  if (validation.decision === 'pass') {
    return '✅ All quality requirements met';
  }
  
  const issues = getTotalIssues(validation);
  return `⚠️ ${issues} issue${issues !== 1 ? 's' : ''} found`;
}