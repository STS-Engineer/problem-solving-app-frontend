// src/services/api/complaints.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to keep FastAPI-style errors clean
function extractErrorMessage(err: any, fallback: string) {
  const detail =
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    fallback;
  return typeof detail === "string" ? detail : fallback;
}

export async function getComplaints(
  params?: {
    skip?: number;
    limit?: number;
    status?: string;
    product_line?: string;
  },
  signal?: AbortSignal,
) {
  try {
    const res = await http.get("/api/v1/complaints", {
      params,
      signal,
    });
    return res.data;
  } catch (err: any) {
    if (axios.isCancel(err) || err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
      throw err; 
    }
    throw new Error(extractErrorMessage(err, "Error during loading"));
  }
}

export async function createComplaintWith8D(data: any) {
  try {
    const res = await http.post("/api/v1/complaints", data);
    return res.data;
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, "Error during creation"));
  }
}

export async function getComplaintById(id: number) {
  try {
    const res = await http.get(`/api/v1/complaints/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, "Error during loading"));
  }
}
