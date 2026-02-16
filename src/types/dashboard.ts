// src/types/dashboard.ts
export type Plant =
  | "MONTERREY"
  | "Kunshan"
  | "CHENNAI"
  | "DAEGU"
  | "TIANJIN"
  | "POITIERS"
  | "FRANKFURT"
  | "SCEET"
  | "SAME"
  | "AMIENS"
  | "ANHUI";

export interface MonthlyData {
  month: string;
  MONTERREY: number;
  Kunshan: number;
  CHENNAI: number;
  DAEGU: number;
  TIANJIN: number;
  POITIERS: number;
  FRANKFURT: number;
  SCEET: number;
  SAME: number;
  AMIENS: number;
  ANHUI: number;
  total: number;
}

export interface PlantTotal {
  plant: string;
  count: number;
}

export interface ClaimsByPlantCustomer {
  plant: string;
  customer1: number;
  customer2: number;
  customer3: number;
  customer4: number;
  customer5: number;
}

export interface CustomerVsSites {
  customer: string;
  [key: string]: number | string;
}

export interface CsiCsiiMonthly {
  month: string;
  C2: number;
  C1: number;
  WR: number;
  QualityAlert: number;
}

export interface DelayTime {
  plant: string;
  d13: number;
  d15: number;
  d18: number;
  llc: number;
}

export interface DefectType {
  type: string;
  count: number;
}

export interface ProductType {
  type: string;
  count: number;
}

export interface CostItem {
  name: string;
  value: number;
}

export interface CostDistribution {
  costD13: CostItem[];
  costD45: CostItem[];
  costD68: CostItem[];
  costLLC: CostItem[];
}

export interface TopPlant {
  plant: string;
  count: number;
}

export interface DashboardData {
  total_complaints: number;
  top_plant: TopPlant;
  last_update: string | null;
  monthly_data: MonthlyData[];
  total_by_plant: PlantTotal[];
  claims_by_plant_customer: ClaimsByPlantCustomer[];
  customer_vs_sites: CustomerVsSites[];
  csi_csii_monthly: CsiCsiiMonthly[];
  delay_time: DelayTime[];
  defect_types: DefectType[];
  product_types: ProductType[];
  cost_distribution: CostDistribution;
}

export interface RecentComplaint {
  id: number;
  reference_number: string;
  complaint_name: string;
  status: string;
  severity: string;
  created_at: string;
}

export interface RealtimeStats {
  total_complaints: number;
  last_update: string | null;
  recent_complaints: RecentComplaint[];
}