import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getStepByComplaintCode,
  saveStepProgress,
  submitStep,
} from '../services/api/reports';
import toast from 'react-hot-toast';

export function useStepData<T>(stepCode: string, defaultData: T) {
  const { complaintId } = useParams<{ complaintId: string }>();
  const navigate = useNavigate();
  
  const [stepId, setStepId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<T>(defaultData);

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
              console.log(data)

      }
    } catch (error) {
      console.error('Error loading step:', error);
      alert('❌ Error loading step data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!stepId) return;

    try {
      setSaving(true);
      await saveStepProgress(stepId, data as any);
      toast.success("Draft saved successfully!")
    } catch (error: any) {
      console.error('Error:', error);
      alert('❌ ' + error.message);
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
      
      // Then submit
      await submitStep(stepId);
      
            toast.success(` Step ${stepCode} submitted successfully!`)

      
      // Navigate to next step
      const nextStepMap: Record<string, string> = {
        'D1': 'D2',
        'D2': 'D3',
        'D3': 'D4',
        'D4': 'D5',
        'D5': 'D6',
        'D6': 'D7',
        'D7': 'D8',
        'D8': 'D8', // Stay on D8
      };
      
      const nextStep = nextStepMap[stepCode];
      if (nextStep) {
        navigate(`/8d/${complaintId}/${nextStep}`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message)
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
    handleSaveDraft,
    handleSubmit,
  };
}