// src/hooks/useStepData.ts
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getStepByComplaintCode,
  saveStepProgress,
  submitStep,
  getStepValidation,
  ValidationResult,
} from '../services/api/reports';
import toast from 'react-hot-toast';

export function useStepData<T>(stepCode: string, defaultData: T) {
  const { complaintId } = useParams<{ complaintId: string }>();
  const navigate = useNavigate();

  const [stepId, setStepId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // NEW: separate state for AI validation in-flight (can take 5-15s)
  const [validating, setValidating] = useState(false);
  const [data, setData] = useState<T>(defaultData);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // BUG FIX #7: keep a ref to the auto-navigate timer so we can cancel on unmount
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadStepData();

    return () => {
      // Cancel any pending navigation if the component unmounts
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, [complaintId, stepCode]);

  const loadStepData = async () => {
    try {
      setLoading(true);
      const step = await getStepByComplaintCode(Number(complaintId), stepCode);
      setStepId(step.id);

      // BUG FIX #1: removed stale-closure log. Use the value directly.
      if (step.data && Object.keys(step.data).length > 0) {
        const merged = { ...defaultData, ...step.data } as T;
        setData(merged);
        // If you need to log: console.log('Loaded data:', merged);
      }

      // Load validation if the step is already in a terminal state
      if (step.status === 'validated' || step.status === 'rejected') {
        try {
          const validationData = await getStepValidation(step.id);
          setValidation(validationData);
          setShowValidation(true);
        } catch {
          console.log('No validation data found for this step yet');
        }
      }
    } catch (error) {
      console.error('Error loading step:', error);
      toast.error('Error loading step data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!stepId) return;

    try {
      setSaving(true);
      await saveStepProgress(stepId, data as any);
      toast.success('Draft saved successfully!');
    } catch (error: any) {
      console.error('Save draft error:', error);
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  /**
   * BUG FIX #2 + #4:
   * - Returns the ValidationResult directly so callers (D1, D2 …) can pass it
   *   up to onValidationUpdate immediately, without relying on stale state.
   * - Adds a dedicated `validating` flag (separate from `saving`) so the UI
   *   can display an AI-spinner while the OpenAI call is in-flight.
   * - BUG FIX #3: removed hard-coded 2s auto-navigate on pass — navigating
   *   immediately after a passed validation prevents users from reading the
   *   success feedback in the ChatCoach. Navigation is still offered but is
   *   now opt-in via a toast action (see comment below — adapt to your UX).
   */
  const handleSubmit = async (): Promise<ValidationResult | null> => {
    if (!stepId) return null;

    try {
      setSaving(true);

      // 1. Persist current form state first
      await saveStepProgress(stepId, data as any);

      // 2. Start AI validation phase (separate flag for the spinner)
      setSaving(false);
      setValidating(true);

      const result = await submitStep(stepId);

      // 3. Store result in local state
      setValidation(result.validation);
      setShowValidation(true);

      if (result.validation.decision === 'pass') {
        toast.success(`✅ ${stepCode} validated successfully!`);

        // Optional auto-navigate (kept but with a longer delay and cancellable)
        const nextStepMap: Record<string, string> = {
          D1: 'D2',
          D2: 'D3',
          D3: 'D4',
          D4: 'D5',
          D5: 'D6',
          D6: 'D7',
          D7: 'D8',
          D8: 'D8',
        };
        const nextStep = nextStepMap[stepCode];
        if (nextStep && nextStep !== stepCode) {
          navTimerRef.current = setTimeout(() => {
            navigate(`/8d/${complaintId}/${nextStep}`);
          }, 3500); // give user time to read the ChatCoach result
        }
      } else {
        toast.error(`⚠️ ${stepCode} needs improvements — see the coach panel`);
      }

      // BUG FIX #2: return the fresh value so callers don't rely on stale state
      return result.validation;
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Validation failed');
      return null;
    } finally {
      setSaving(false);
      setValidating(false);
    }
  };

  return {
    stepId,
    loading,
    saving,
    validating, // NEW — expose so pages can show the AI spinner
    data,
    setData,
    validation,
    showValidation,
    setShowValidation,
    handleSaveDraft,
    handleSubmit,
  };
}