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

export interface StatusMonthly {
  month: string;
  open: number;
  in_progress: number;
  under_review: number;
  resolved: number;
  closed: number;
  rejected: number;
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

// UPDATED: Report statistics interface
export interface ReportStepCompletion {
  step: string;
  completed: number;
  total: number;
  completion_rate: number;
}

export interface ReportStatistics {
  total_reports: number;
  by_status: {
    [status: string]: number;
  };
  step_completion: ReportStepCompletion[];
}

// UPDATED: Main dashboard data interface
export interface DashboardData {
  total_complaints: number;
  top_plant: TopPlant;
  last_update: string | null;
  monthly_data: MonthlyData[];
  total_by_plant: PlantTotal[];
  claims_by_plant_customer: ClaimsByPlantCustomer[];
  customer_vs_sites: CustomerVsSites[];
  status_monthly: StatusMonthly[]; // CHANGED: from csi_csii_monthly to status_monthly
  delay_time: DelayTime[];
  defect_types: DefectType[];
  product_types: ProductType[];
  cost_distribution: CostDistribution;
  report_stats?: ReportStatistics; // ADDED: Optional report statistics
  selected_year?: number; // ADDED: Optional selected year
  is_current_year?: boolean; // ADDED: Optional current year flag
}

export interface RecentComplaint {
  id: number;
  reference_number: string;
  complaint_name: string;
  status: string;
  customer?: string; // ADDED: Optional customer
  avocarbon_plant?: string; // ADDED: Optional plant
  created_at: string;
}

export interface RealtimeStats {
  total_complaints: number;
  open_complaints?: number; // ADDED: Optional open complaints count
  last_update: string | null;
  recent_complaints: RecentComplaint[];
  year?: number; // ADDED: Optional year
}

// ADDED: Available years response
export interface AvailableYearsResponse {
  years: number[];
  current_year: number;
  default_year: number;
}

// ADDED: Year comparison response
export interface YearComparison {
  year: number;
  total_complaints: number;
  top_plant: TopPlant;
  open_complaints: number;
  defect_types_count: number;
  product_types_count: number;
}

export interface YearComparisonResponse {
  comparison: YearComparison[];
  years_compared: number[];
}

// ADDED: Report stats response
export interface ReportStatsResponse {
  year: number;
  report_statistics: ReportStatistics;
  delay_time: DelayTime[];
}