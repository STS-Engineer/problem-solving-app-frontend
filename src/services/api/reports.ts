import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';



export async function saveStepProgress(stepId: number, data: any) {
  const response = await fetch(`${API_URL}/api/v1/steps/${stepId}/save`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erreur lors de la sauvegarde');
  }

  return response.json();
}

export async function submitStep(stepId: number) {
  const response = await fetch(`${API_URL}/api/v1/steps/${stepId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erreur lors de la soumission');
  }

  return response.json();
}

export async function getStepByComplaintCode(complaintId: number, stepCode: string) {
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
    throw new Error(error.detail || 'Étape non trouvée');
  }

  return response.json();
}

export async function getCurrentStepByComplaint(complaintId: number) {
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
    throw new Error(error.detail || 'Étape courante non trouvée');
  }

  return response.json();
}

export async function getStepsByComplaintId(complaintId: number) {
  const res = await axios.get(`${API_URL}/api/v1/steps/complaint/${complaintId}/steps`);
  return res.data;
}


