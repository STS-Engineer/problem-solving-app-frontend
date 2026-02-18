import { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import logo from "../assets/images/logo-avocarbon.png";
import AppHeader from "../components/AppHeader";
import type { DashboardData, Plant } from "../types/dashboard";

const PLANTS: Plant[] = [
  "MONTERREY",
  "Kunshan",
  "CHENNAI",
  "DAEGU",
  "TIANJIN",
  "POITIERS",
  "FRANKFURT",
  "SCEET",
  "SAME",
  "AMIENS",
  "ANHUI",
];

const PLANT_COLORS: Record<Plant, string> = {
  MONTERREY: "#FF8C42",
  Kunshan: "#4A90E2",
  CHENNAI: "#7ED321",
  DAEGU: "#00BCD4",
  TIANJIN: "#9B59B6",
  POITIERS: "#F1C40F",
  FRANKFURT: "#4A7CFF",
  SCEET: "#B8A494",
  SAME: "#34495E",
  AMIENS: "#1A1A1A",
  ANHUI: "#D63031",
};

const INDUSTRIAL_COLORS = {
  primary: "#2C3E50",
  secondary: "#34495E",
  accent: "#4A7CFF",
  success: "#27AE60",
  warning: "#F39C12",
  danger: "#E74C3C",
  info: "#3498DB",
  dark: "#1A1A1A",
  light: "#ECF0F1",
  border: "#BDC3C7",
};

function secondsToHmsShort(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "00:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface AvailableYears {
  years: number[];
  current_year: number;
  default_year: number;
}

export default function Dashboard() {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  // Fetch available years on mount
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/dashboard/available-years`,
        );
        if (response.ok) {
          const data: AvailableYears = await response.json();
          setAvailableYears(data.years);
          setYear(data.default_year);
        }
      } catch (err) {
        console.error("Failed to fetch available years:", err);
        setYear(new Date().getFullYear());
      }
    };

    fetchAvailableYears();
  }, []);

  // Fetch full dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/stats?year=${year}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DashboardData = await response.json();
      setDashboardData(data);
      setLastFetchTime(new Date());
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [year]);

  // Fetch lightweight real-time stats
  const fetchRealtimeStats = useCallback(async () => {
    if (!dashboardData) return;

    setIsRefreshing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/stats/realtime?year=${year}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setDashboardData((prev) =>
        prev
          ? {
              ...prev,
              total_complaints: data.total_complaints,
              last_update: data.last_update,
            }
          : null,
      );

      setLastFetchTime(new Date());
    } catch (err) {
      console.error("Failed to fetch realtime stats:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [dashboardData, year]);

  // Initial fetch and year changes
  useEffect(() => {
    if (year) {
      fetchDashboardData();
    }
  }, [fetchDashboardData]);

  // Polling for real-time updates (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRealtimeStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchRealtimeStats]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
  };

  // Derived data with fallbacks - BEFORE loading/error checks
  const monthly = useMemo(
    () => dashboardData?.monthly_data || [],
    [dashboardData],
  );
  const totalByPlant = useMemo(
    () => dashboardData?.total_by_plant || [],
    [dashboardData],
  );
  const claimsByPlantCustomer = useMemo(
    () => dashboardData?.claims_by_plant_customer || [],
    [dashboardData],
  );
  const customerVsAvoCarbon = useMemo(
    () => dashboardData?.customer_vs_sites || [],
    [dashboardData],
  );
  const statusMonthly = useMemo(
    () => dashboardData?.status_monthly || [],
    [dashboardData],
  ); // FIXED: Changed from csi_csii_monthly to status_monthly
  const delayTime = useMemo(
    () => dashboardData?.delay_time || [],
    [dashboardData],
  );
  const defectType = useMemo(
    () => dashboardData?.defect_types || [],
    [dashboardData],
  );
  const productType = useMemo(
    () => dashboardData?.product_types || [],
    [dashboardData],
  );
  const costD13 = useMemo(
    () => dashboardData?.cost_distribution?.costD13 || [],
    [dashboardData],
  );
  const costD45 = useMemo(
    () => dashboardData?.cost_distribution?.costD45 || [],
    [dashboardData],
  );
  const costD68 = useMemo(
    () => dashboardData?.cost_distribution?.costD68 || [],
    [dashboardData],
  );
  const costLLC = useMemo(
    () => dashboardData?.cost_distribution?.costLLC || [],
    [dashboardData],
  );

  const totalComplaints = dashboardData?.total_complaints || 0;
  const topPlant = dashboardData?.top_plant || { plant: "N/A", count: 0 };
  const lastUpdate = dashboardData?.last_update;

  const formatLastUpdate = (
    dateString: string | null | undefined,
  ): { date: string; time: string } => {
    if (!dateString) return { date: "N/A", time: "N/A" };

    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const formattedUpdate = formatLastUpdate(lastUpdate);

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #E8EAF6 0%, #F5F7FA 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            border: "4px solid #E0E0E0",
            borderTop: "4px solid #4A7CFF",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div style={{ fontSize: 18, color: "#78909C", fontWeight: 600 }}>
          Loading dashboard...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #E8EAF6 0%, #F5F7FA 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 20,
          padding: 24,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div
          style={{
            fontSize: 24,
            color: INDUSTRIAL_COLORS.danger,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Loading Error
        </div>
        <div style={{ fontSize: 16, color: "#78909C", marginBottom: 24 }}>
          {error}
        </div>
        <button
          onClick={handleRefresh}
          style={{
            background: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
            color: "white",
            padding: "12px 32px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(74, 124, 255, 0.3)",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E8EAF6 0%, #F5F7FA 100%)",
        padding: "24px",
      }}
    >
      {/* Header with Year Selector */}
      <AppHeader
        title="Quality Control Dashboard"
        logoSrc={logo}
        actions={
          <>
            {/* Year Selector */}
            <select
              value={year}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
                padding: "12px 20px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(10px)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {availableYears.length > 0 ? (
                availableYears.map((y) => (
                  <option key={y} value={y} style={{ color: "#2C3E50" }}>
                    {y}
                  </option>
                ))
              ) : (
                <option value={year} style={{ color: "#2C3E50" }}>
                  {year}
                </option>
              )}
            </select>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                background: isRefreshing
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.1)",
                color: "white",
                padding: "12px 20px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                cursor: isRefreshing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: isRefreshing ? 0.6 : 1,
              }}
            >
              <span style={{ fontSize: 16 }}>🔄</span>
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              to="/complaints/new"
              style={{
                background: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
                color: "white",
                padding: "12px 24px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                border: "none",
                boxShadow: "0 4px 12px rgba(74, 124, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              + New Complaint
            </Link>

            <Link
              to="/complaints"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "white",
                padding: "12px 24px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Complaints List
            </Link>
          </>
        }
      />

      {/* Real-time indicator */}
      {lastFetchTime && (
        <div
          style={{
            background: "white",
            borderRadius: 8,
            padding: "8px 16px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid #E0E0E0",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: isRefreshing ? "#F39C12" : "#27AE60",
              animation: isRefreshing
                ? "pulse 1.5s ease-in-out infinite"
                : "none",
            }}
          />
          <div style={{ fontSize: 13, color: "#78909C" }}>
            {isRefreshing
              ? "Updating..."
              : `Last updated: ${lastFetchTime.toLocaleTimeString("en-US")}`}
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 13,
              color: "#4A7CFF",
              fontWeight: 600,
            }}
          >
            Year: {year}
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `}</style>
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Total Complaints Card */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #E0E0E0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 120,
              height: 120,
              background:
                "linear-gradient(135deg, rgba(74, 124, 255, 0.1) 0%, transparent 100%)",
              borderRadius: "0 16px 0 50%",
            }}
          />
          <div
            style={{
              fontSize: 13,
              color: "#78909C",
              marginBottom: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Total Complaints
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: 12,
              color: INDUSTRIAL_COLORS.primary,
            }}
          >
            {totalComplaints}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(74, 124, 255, 0.1)",
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: INDUSTRIAL_COLORS.accent,
            }}
          >
            <span style={{ fontSize: 16 }}>📊</span>
            Year {year}
          </div>
        </div>

        {/* Top Plant Card */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #E0E0E0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 120,
              height: 120,
              background:
                "linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, transparent 100%)",
              borderRadius: "0 16px 0 50%",
            }}
          />
          <div
            style={{
              fontSize: 13,
              color: "#78909C",
              marginBottom: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Top Priority Plant
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 900,
              lineHeight: 1.2,
              marginBottom: 12,
              color: INDUSTRIAL_COLORS.primary,
            }}
          >
            {topPlant.plant}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255, 140, 66, 0.1)",
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: "#FF8C42",
            }}
          >
            <span style={{ fontSize: 16 }}>🏭</span>
            {topPlant.count} complaints
          </div>
        </div>

        {/* Last Update Card */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #E0E0E0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 120,
              height: 120,
              background:
                "linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, transparent 100%)",
              borderRadius: "0 16px 0 50%",
            }}
          />
          <div
            style={{
              fontSize: 13,
              color: "#78909C",
              marginBottom: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Last Update
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: 4,
              color: INDUSTRIAL_COLORS.primary,
            }}
          >
            {formattedUpdate.date}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(39, 174, 96, 0.1)",
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: INDUSTRIAL_COLORS.success,
            }}
          >
            <span style={{ fontSize: 16 }}>🕐</span>
            {formattedUpdate.time}
          </div>
        </div>
      </div>

      {/* Section principale avec graphiques */}
      <div style={{ display: "grid", gap: 24 }}>
        {/* Monthly Evolution Chart */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #E0E0E0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "24px 32px",
              borderBottom: `3px solid ${INDUSTRIAL_COLORS.accent}`,
              background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background:
                    "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                📈
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    color: INDUSTRIAL_COLORS.primary,
                  }}
                >
                  Monthly Complaints Evolution
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#78909C",
                    margin: "4px 0 0 0",
                  }}
                >
                  Distribution by production site (stacked view)
                </p>
              </div>
            </div>
          </div>
          <div style={{ padding: 32 }}>
            <div style={{ width: "100%", height: 380 }}>
              <ResponsiveContainer>
                <BarChart data={monthly}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E0E0E0"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#78909C", fontSize: 13, fontWeight: 600 }}
                    tickLine={{ stroke: "#E0E0E0" }}
                    axisLine={{ stroke: "#E0E0E0" }}
                  />
                  <YAxis
                    tick={{ fill: "#78909C", fontSize: 13, fontWeight: 600 }}
                    tickLine={{ stroke: "#E0E0E0" }}
                    axisLine={{ stroke: "#E0E0E0" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.98)",
                      border: `2px solid ${INDUSTRIAL_COLORS.accent}`,
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      padding: "12px 16px",
                    }}
                    cursor={{ fill: "rgba(74, 124, 255, 0.05)" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 24 }} iconType="circle" />
                  {PLANTS.map((p) => (
                    <Bar
                      key={p}
                      dataKey={p}
                      stackId="a"
                      fill={PLANT_COLORS[p]}
                      radius={[0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Two columns: Total by plant + Customer breakdown */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          {/* Total by plant - simple */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #E0E0E0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px 32px",
                borderBottom: `3px solid ${INDUSTRIAL_COLORS.warning}`,
                background: "linear-gradient(135deg, #FFF9F0 0%, #FFFFFF 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background:
                      "linear-gradient(135deg, #FF8C42 0%, #E67326 100%)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  🏭
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: INDUSTRIAL_COLORS.primary,
                    }}
                  >
                    Total Complaints by Plant
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#78909C",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Site ranking
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ width: "100%", height: 360 }}>
                <ResponsiveContainer>
                  <BarChart data={totalByPlant} layout="horizontal">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E0E0E0"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="plant"
                      tick={{ fill: "#78909C", fontSize: 12, fontWeight: 600 }}
                      tickLine={{ stroke: "#E0E0E0" }}
                      axisLine={{ stroke: "#E0E0E0" }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis
                      tick={{ fill: "#78909C", fontSize: 13, fontWeight: 600 }}
                      tickLine={{ stroke: "#E0E0E0" }}
                      axisLine={{ stroke: "#E0E0E0" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255,255,255,0.98)",
                        border: `2px solid ${INDUSTRIAL_COLORS.warning}`,
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        padding: "12px 16px",
                      }}
                      cursor={{ fill: "rgba(255, 140, 66, 0.05)" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#FF8C42"
                      radius={[8, 8, 0, 0]}
                      label={{
                        position: "top",
                        fill: INDUSTRIAL_COLORS.primary,
                        fontWeight: 700,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Total by plant with customer breakdown (stacked) */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #E0E0E0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px 32px",
                borderBottom: `3px solid ${INDUSTRIAL_COLORS.info}`,
                background: "linear-gradient(135deg, #F0F7FF 0%, #FFFFFF 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background:
                      "linear-gradient(135deg, #3498DB 0%, #2C7CBD 100%)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  👥
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: INDUSTRIAL_COLORS.primary,
                    }}
                  >
                    Origin: Plant vs Customer
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#78909C",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Breakdown by customer
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ width: "100%", height: 360 }}>
                <ResponsiveContainer>
                  <BarChart data={claimsByPlantCustomer} layout="horizontal">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E0E0E0"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="plant"
                      tick={{ fill: "#78909C", fontSize: 12, fontWeight: 600 }}
                      tickLine={{ stroke: "#E0E0E0" }}
                      axisLine={{ stroke: "#E0E0E0" }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis
                      tick={{ fill: "#78909C", fontSize: 13, fontWeight: 600 }}
                      tickLine={{ stroke: "#E0E0E0" }}
                      axisLine={{ stroke: "#E0E0E0" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255,255,255,0.98)",
                        border: `2px solid ${INDUSTRIAL_COLORS.info}`,
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        padding: "12px 16px",
                      }}
                      cursor={{ fill: "rgba(52, 152, 219, 0.05)" }}
                    />
                    <Legend iconType="circle" />
                    <Bar
                      dataKey="customer1"
                      stackId="a"
                      name="Main Customer"
                      fill="#4A7CFF"
                    />
                    <Bar
                      dataKey="customer2"
                      stackId="a"
                      name="Customer 2"
                      fill="#7ED321"
                    />
                    <Bar
                      dataKey="customer3"
                      stackId="a"
                      name="Customer 3"
                      fill="#FF8C42"
                    />
                    <Bar
                      dataKey="customer4"
                      stackId="a"
                      name="Customer 4"
                      fill="#9B59B6"
                    />
                    <Bar
                      dataKey="customer5"
                      stackId="a"
                      name="Others"
                      fill="#34495E"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Customer VS AvoCarbon Sites */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #E0E0E0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "24px 32px",
              borderBottom: `3px solid ${INDUSTRIAL_COLORS.success}`,
              background: "linear-gradient(135deg, #F0FFF4 0%, #FFFFFF 100%)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background:
                    "linear-gradient(135deg, #27AE60 0%, #1E8449 100%)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                🌍
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    color: INDUSTRIAL_COLORS.primary,
                  }}
                >
                  Customers vs AvoCarbon Sites
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#78909C",
                    margin: "4px 0 0 0",
                  }}
                >
                  Complaints distribution by customer and production site
                </p>
              </div>
            </div>
          </div>
          <div style={{ padding: 32 }}>
            <div style={{ width: "100%", height: 380 }}>
              <ResponsiveContainer>
                <BarChart data={customerVsAvoCarbon}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E0E0E0"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="customer"
                    tick={{ fill: "#78909C", fontSize: 12, fontWeight: 600 }}
                    tickLine={{ stroke: "#E0E0E0" }}
                    axisLine={{ stroke: "#E0E0E0" }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis
                    tick={{ fill: "#78909C", fontSize: 13, fontWeight: 600 }}
                    tickLine={{ stroke: "#E0E0E0" }}
                    axisLine={{ stroke: "#E0E0E0" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.98)",
                      border: `2px solid ${INDUSTRIAL_COLORS.success}`,
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      padding: "12px 16px",
                    }}
                    cursor={{ fill: "rgba(39, 174, 96, 0.05)" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                  {PLANTS.map((p) => (
                    <Bar
                      key={p}
                      dataKey={p}
                      stackId="a"
                      fill={PLANT_COLORS[p]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Monthly + Delay Time */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          {/* Status Monthly */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #E0E0E0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px 32px",
                borderBottom: `3px solid ${INDUSTRIAL_COLORS.danger}`,
                background: "linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background:
                      "linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  ⚠️
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: INDUSTRIAL_COLORS.primary,
                    }}
                  >
                    Monthly Status Distribution
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#78909C",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Classification by status type
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ width: "100%", height: 340 }}>
                <ResponsiveContainer>
                  <BarChart data={statusMonthly}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E0E0E0"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#78909C", fontSize: 12, fontWeight: 600 }}
                      tickLine={{ stroke: "#E0E0E0" }}
                      axisLine={{ stroke: "#E0E0E0" }}
                    />
                    <YAxis
                      tick={{ fill: "#78909C", fontSize: 13, fontWeight: 600 }}
                      tickLine={{ stroke: "#E0E0E0" }}
                      axisLine={{ stroke: "#E0E0E0" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255,255,255,0.98)",
                        border: `2px solid ${INDUSTRIAL_COLORS.danger}`,
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        padding: "12px 16px",
                      }}
                      cursor={{ fill: "rgba(231, 76, 60, 0.05)" }}
                    />
                    <Legend iconType="circle" />
                    <Bar
                      dataKey="open"
                      stackId="a"
                      name="Open"
                      fill="#FF8C42"
                    />
                    <Bar
                      dataKey="in_progress"
                      stackId="a"
                      name="In Progress"
                      fill="#3498DB"
                    />
                    <Bar
                      dataKey="under_review"
                      stackId="a"
                      name="Under Review"
                      fill="#9B59B6"
                    />
                    <Bar
                      dataKey="resolved"
                      stackId="a"
                      name="Resolved"
                      fill="#27AE60"
                    />
                    <Bar
                      dataKey="closed"
                      stackId="a"
                      name="Closed"
                      fill="#95A5A6"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Delay Time */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #E0E0E0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px 32px",
                borderBottom: `3px solid #9B59B6`,
                background: "linear-gradient(135deg, #F8F5FF 0%, #FFFFFF 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background:
                      "linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  ⏱️
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: INDUSTRIAL_COLORS.primary,
                    }}
                  >
                    Processing Time
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#78909C",
                      margin: "4px 0 0 0",
                    }}
                  >
                    D1→D3 / D1→D5 / D1→D8 / LLC
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ width: "100%", height: 340 }}>
                {delayTime.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={delayTime}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E0E0E0"
                        strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="plant"
                        tick={{
                          fill: "#78909C",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                        tickLine={{ stroke: "#E0E0E0" }}
                        axisLine={{ stroke: "#E0E0E0" }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        tickFormatter={secondsToHmsShort}
                        tick={{
                          fill: "#78909C",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        tickLine={{ stroke: "#E0E0E0" }}
                        axisLine={{ stroke: "#E0E0E0" }}
                      />
                      <Tooltip
                        formatter={(v: any) => secondsToHmsShort(Number(v))}
                        labelFormatter={(l) => `Plant: ${l}`}
                        contentStyle={{
                          background: "rgba(255,255,255,0.98)",
                          border: "2px solid #9B59B6",
                          borderRadius: 12,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          padding: "12px 16px",
                        }}
                        cursor={{ fill: "rgba(155, 89, 182, 0.05)" }}
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="d13" name="D1→D3" fill="#4A7CFF" />
                      <Bar dataKey="d15" name="D1→D5" fill="#9B59B6" />
                      <Bar dataKey="d18" name="D1→D8" fill="#E74C3C" />
                      <Bar dataKey="llc" name="LLC" fill="#F39C12" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9CA3AF",
                      fontSize: 14,
                    }}
                  >
                    No delay time data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Defect & Product Type */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #E0E0E0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px 32px",
                borderBottom: `3px solid #00BCD4`,
                background: "linear-gradient(135deg, #E0F7FA 0%, #FFFFFF 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background:
                      "linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  🔍
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: INDUSTRIAL_COLORS.primary,
                    }}
                  >
                    Defect Type
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#78909C",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Quality classification
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ width: "100%", height: 280 }}>
                {defectType.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={defectType}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E0E0E0"
                        strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="type"
                        tick={{
                          fill: "#78909C",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        tickLine={{ stroke: "#E0E0E0" }}
                        axisLine={{ stroke: "#E0E0E0" }}
                      />
                      <YAxis
                        tick={{
                          fill: "#78909C",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                        tickLine={{ stroke: "#E0E0E0" }}
                        axisLine={{ stroke: "#E0E0E0" }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255,255,255,0.98)",
                          border: "2px solid #00BCD4",
                          borderRadius: 12,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          padding: "12px 16px",
                        }}
                        cursor={{ fill: "rgba(0, 188, 212, 0.05)" }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#00BCD4"
                        radius={[8, 8, 0, 0]}
                        label={{
                          position: "top",
                          fill: INDUSTRIAL_COLORS.primary,
                          fontWeight: 700,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9CA3AF",
                      fontSize: 14,
                    }}
                  >
                    No defect data available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid #E0E0E0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px 32px",
                borderBottom: `3px solid #7ED321`,
                background: "linear-gradient(135deg, #F1F8E9 0%, #FFFFFF 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background:
                      "linear-gradient(135deg, #7ED321 0%, #6BB91A 100%)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  📦
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: INDUSTRIAL_COLORS.primary,
                    }}
                  >
                    Product Type
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#78909C",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Product categories
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ width: "100%", height: 280 }}>
                {productType.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={productType}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E0E0E0"
                        strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="type"
                        tick={{
                          fill: "#78909C",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        tickLine={{ stroke: "#E0E0E0" }}
                        axisLine={{ stroke: "#E0E0E0" }}
                      />
                      <YAxis
                        tick={{
                          fill: "#78909C",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                        tickLine={{ stroke: "#E0E0E0" }}
                        axisLine={{ stroke: "#E0E0E0" }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255,255,255,0.98)",
                          border: "2px solid #7ED321",
                          borderRadius: 12,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          padding: "12px 16px",
                        }}
                        cursor={{ fill: "rgba(126, 211, 33, 0.05)" }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#7ED321"
                        radius={[8, 8, 0, 0]}
                        label={{
                          position: "top",
                          fill: INDUSTRIAL_COLORS.primary,
                          fontWeight: 700,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9CA3AF",
                      fontSize: 14,
                    }}
                  >
                    No product data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Distribution - Placeholder */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #E0E0E0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "24px 32px",
              borderBottom: `3px solid #F39C12`,
              background: "linear-gradient(135deg, #FFF8E1 0%, #FFFFFF 100%)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background:
                    "linear-gradient(135deg, #F39C12 0%, #D68910 100%)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                💰
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    color: INDUSTRIAL_COLORS.primary,
                  }}
                >
                  Cost Distribution by Phase
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#78909C",
                    margin: "4px 0 0 0",
                  }}
                >
                  Percentage distribution (D1-D3 / D4-D5 / D6-D8 / LLC)
                </p>
              </div>
            </div>
          </div>
          <div style={{ padding: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
                color: "#9CA3AF",
                fontSize: 14,
              }}
            >
              Cost tracking not yet implemented
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 32,
          padding: "20px 28px",
          background: "white",
          borderRadius: 12,
          border: `1px solid ${INDUSTRIAL_COLORS.border}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            background: "linear-gradient(135deg, #4A7CFF 0%, #2C5FE0 100%)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          ℹ️
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: INDUSTRIAL_COLORS.primary,
              marginBottom: 4,
            }}
          >
            Industrial Quality Management System
          </div>
          <div style={{ fontSize: 13, color: "#78909C" }}>
            Real-time dashboard • Consolidated and auto-updated data • Export
            available
          </div>
        </div>
      </div>
    </div>
  );
}
