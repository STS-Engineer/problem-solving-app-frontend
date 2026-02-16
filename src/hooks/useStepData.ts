// src/hooks/useStepData.ts (add effect to sync validation)
import { useState, useEffect } from 'react';
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
  const [data, setData] = useState<T>(defaultData);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Load step data on mount
  useEffect(() => {
    loadStepData();
  }, [complaintId, stepCode]);

  const loadStepData = async () => {
    try {
      setLoading(true);
      const step = await getStepByComplaintCode(Number(complaintId), stepCode);
      setStepId(step.id);
      
      // Load existing data if available
      if (step.data && Object.keys(step.data).length > 0) {
        setData({ ...defaultData, ...step.data });
        console.log('Loaded data:', data);
      }

      // Load validation if exists
      if (step.status === 'validated' || step.status === 'rejected') {
        try {
          const validationData = await getStepValidation(step.id);
          setValidation(validationData);
        } catch (err) {
          console.log('No validation data found');
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
      toast.success("Draft saved successfully!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!stepId) return;

    try {
      setSaving(true);
      
      // Save first
      await saveStepProgress(stepId, data as any);
      
      // Then submit for AI validation
      const result = await submitStep(stepId);
      
      // Store validation result
      setValidation(result.validation);
      setShowValidation(true);
      
      if (result.validation.decision === 'pass') {
        toast.success(`✅ ${stepCode} validated successfully!`);
        
        // Navigate to next step after a short delay
        setTimeout(() => {
          const nextStepMap: Record<string, string> = {
            'D1': 'D2',
            'D2': 'D3',
            'D3': 'D4',
            'D4': 'D5',
            'D5': 'D6',
            'D6': 'D7',
            'D7': 'D8',
            'D8': 'D8',
          };
          
          const nextStep = nextStepMap[stepCode];
          if (nextStep && nextStep !== stepCode) {
            navigate(`/8d/${complaintId}/${nextStep}`);
          }
        }, 2000);
      } else {
        toast.error(`⚠️ ${stepCode} needs improvements`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Validation failed');
    } finally {
      setSaving(false);
    }
  };

  return {
    stepId,
    loading,
    saving,
    data,
    setData,
    validation,
    showValidation,
    setShowValidation,
    handleSaveDraft,
    handleSubmit,
  };
}