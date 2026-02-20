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
function deepMergeWithDefaults<T>(defaults: T, apiData: unknown): T {
  if (apiData === null || apiData === undefined) return defaults;
  if (Array.isArray(defaults) && Array.isArray(apiData)) {
    return apiData.map((item, i) =>
      deepMergeWithDefaults(
        (defaults as any[])[i] ?? (defaults as any[])[0] ?? {},
        item,
      ),
    ) as unknown as T;
  }

  // Plain objects: recurse key-by-key
  if (
    typeof defaults === 'object' &&
    typeof apiData === 'object' &&
    !Array.isArray(apiData)
  ) {
    const result = { ...(defaults as object) } as any;
    for (const key of Object.keys(apiData as object)) {
      const apiVal = (apiData as any)[key];
      const defVal = (defaults as any)[key];

      if (apiVal === null || apiVal === undefined) {
        // Keep the default (empty string / 0 / [] / {})
        result[key] = defVal ?? '';
      } else if (typeof defVal === 'object' && defVal !== null) {
        // Recurse into nested objects / arrays
        result[key] = deepMergeWithDefaults(defVal, apiVal);
      } else {
        result[key] = apiVal;
      }
    }
    return result as T;
  }

  return apiData as T;
}

export function useStepData<T>(stepCode: string, defaultData: T) {
  const { complaintId } = useParams<{ complaintId: string }>();
  const navigate = useNavigate();

  const [stepId, setStepId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [data, setData] = useState<T>(defaultData);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadedKeyRef = useRef<string | null>(null);

useEffect(() => {
  const key = `${complaintId}-${stepCode}`;
  if (loadedKeyRef.current === key) return; // already loaded, skip
  loadedKeyRef.current = key;
  loadStepData();

  return () => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
  };
}, [complaintId, stepCode]);

  const loadStepData = async () => {
    try {
      setLoading(true);
      const step = await getStepByComplaintCode(Number(complaintId), stepCode);
      setStepId(step.id);

      if (step.data && Object.keys(step.data).length > 0) {
        const merged = deepMergeWithDefaults<T>(defaultData, step.data);
        setData(merged);
      }

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

  const handleSubmit = async (): Promise<ValidationResult | null> => {
    if (!stepId) return null;

    try {
      setSaving(true);

      await saveStepProgress(stepId, data as any);

      setSaving(false);
      setValidating(true);

      const result = await submitStep(stepId);

      setValidation(result.validation);
      setShowValidation(true);

      if (result.validation.decision === 'pass') {
        toast.success(`✅ ${stepCode} validated successfully!`);

        const nextStepMap: Record<string, string> = {
          D1: 'D2', D2: 'D3', D3: 'D4', D4: 'D5',
          D5: 'D6', D6: 'D7', D7: 'D8', D8: 'D8',
        };
        const nextStep = nextStepMap[stepCode];
        if (nextStep && nextStep !== stepCode) {
          navTimerRef.current = setTimeout(() => {
            navigate(`/8d/${complaintId}/${nextStep}`);
          }, 3500);
        }
      } else {
        toast.error(`⚠️ ${stepCode} needs improvements — see the coach panel`);
      }

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
    validating,
    data,
    setData,
    validation,
    showValidation,
    setShowValidation,
    handleSaveDraft,
    handleSubmit,
  };
}