import { useMemo, useState } from "react";
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

type Plant =
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

// Palette industrielle professionnelle - tons sombres et métalliques
const PLANT_COLORS: Record<Plant, string> = {
  MONTERREY: "#FF8C42", // Orange industriel
  Kunshan: "#4A90E2", // Bleu acier
  CHENNAI: "#7ED321", // Vert lime
  DAEGU: "#00BCD4", // Cyan tech
  TIANJIN: "#9B59B6", // Violet profond
  POITIERS: "#F1C40F", // Jaune industriel
  FRANKFURT: "#4A7CFF", // Bleu électrique
  SCEET: "#B8A494", // Beige métallique
  SAME: "#34495E", // Gris ardoise
  AMIENS: "#1A1A1A", // Noir charbon
  ANHUI: "#D63031", // Rouge vif
};

const CUSTOMER_COLORS: Record<string, string> = {
  "AVO CARBON Poitiers": "#4A7CFF",
  "Avo Kunshan": "#00BCD4",
  "Bosch Changsha": "#7ED321",
  "Changsha Valeo": "#FF8C42",
  HUAN: "#9B59B6",
  "AVO MEXICO PLANT": "#F1C40F",
  "Avo germany": "#4A90E2",
  Changsha: "#D63031",
  Chongqing: "#34495E",
  "AVO Mexico plant": "#B8A494",
  "Changsha Valeo Automotive Wiper Systems Co.,LTD": "#16A085",
  "HUAN MOTOR": "#8E44AD",
  "AVO Tianjin": "#E67E22",
  Buhler: "#C0392B",
  "Changsha Valeo Automotive Wiper Systems Co. LTD": "#27AE60",
  "Aditya Auto components": "#1ABC9C",
  "Buhler C2": "#3498DB",
  "Changsha Valeo Automotive Wiper Systems Co.,Ltd": "#F39C12",
};

// Couleur moderne pour graphiques simples
const PRIMARY_GRADIENT = {
  start: "#4A7CFF",
  end: "#2C5FE0",
};

const INDUSTRIAL_COLORS = {
  primary: "#2C3E50", // Gris foncé
  secondary: "#34495E", // Gris ardoise
  accent: "#4A7CFF", // Bleu tech
  success: "#27AE60", // Vert industriel
  warning: "#F39C12", // Orange attention
  danger: "#E74C3C", // Rouge alerte
  info: "#3498DB", // Bleu info
  dark: "#1A1A1A", // Noir profond
  light: "#ECF0F1", // Gris clair
  border: "#BDC3C7", // Gris bordure
};

function hmsToSeconds(hms: string) {
  const [h, m, s] = hms.split(":").map((x) => Number(x));
  return h * 3600 + m * 60 + s;
}

function secondsToHmsShort(sec: number) {
  if (!Number.isFinite(sec) || sec <= 0) return "00:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function Dashboard() {
  const [year] = useState(2025);

  const monthly = useMemo(
    () => [
      {
        month: "Jan",
        MONTERREY: 1,
        Kunshan: 0,
        CHENNAI: 1,
        DAEGU: 0,
        TIANJIN: 1,
        POITIERS: 0,
        FRANKFURT: 5,
        SCEET: 0,
        SAME: 1,
        AMIENS: 0,
        ANHUI: 0,
        total: 9,
      },
      {
        month: "Fév",
        MONTERREY: 3,
        Kunshan: 0,
        CHENNAI: 0,
        DAEGU: 0,
        TIANJIN: 1,
        POITIERS: 0,
        FRANKFURT: 0,
        SCEET: 5,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 0,
        total: 9,
      },
      {
        month: "Mar",
        MONTERREY: 2,
        Kunshan: 0,
        CHENNAI: 0,
        DAEGU: 0,
        TIANJIN: 0,
        POITIERS: 0,
        FRANKFURT: 0,
        SCEET: 0,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 1,
        total: 3,
      },
      {
        month: "Avr",
        MONTERREY: 2,
        Kunshan: 0,
        CHENNAI: 0,
        DAEGU: 0,
        TIANJIN: 1,
        POITIERS: 0,
        FRANKFURT: 6,
        SCEET: 1,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 2,
        total: 12,
      },
      {
        month: "Mai",
        MONTERREY: 4,
        Kunshan: 0,
        CHENNAI: 1,
        DAEGU: 0,
        TIANJIN: 0,
        POITIERS: 0,
        FRANKFURT: 0,
        SCEET: 0,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 1,
        total: 6,
      },
      {
        month: "Jun",
        MONTERREY: 2,
        Kunshan: 0,
        CHENNAI: 1,
        DAEGU: 0,
        TIANJIN: 0,
        POITIERS: 0,
        FRANKFURT: 6,
        SCEET: 0,
        SAME: 2,
        AMIENS: 0,
        ANHUI: 0,
        total: 11,
      },
      {
        month: "Jul",
        MONTERREY: 0,
        Kunshan: 0,
        CHENNAI: 3,
        DAEGU: 1,
        TIANJIN: 0,
        POITIERS: 0,
        FRANKFURT: 0,
        SCEET: 1,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 0,
        total: 6,
      },
      {
        month: "Aoû",
        MONTERREY: 0,
        Kunshan: 0,
        CHENNAI: 0,
        DAEGU: 0,
        TIANJIN: 1,
        POITIERS: 0,
        FRANKFURT: 5,
        SCEET: 1,
        SAME: 1,
        AMIENS: 0,
        ANHUI: 0,
        total: 8,
      },
      {
        month: "Sep",
        MONTERREY: 0,
        Kunshan: 0,
        CHENNAI: 0,
        DAEGU: 1,
        TIANJIN: 1,
        POITIERS: 0,
        FRANKFURT: 3,
        SCEET: 3,
        SAME: 0,
        AMIENS: 1,
        ANHUI: 0,
        total: 9,
      },
      {
        month: "Oct",
        MONTERREY: 3,
        Kunshan: 0,
        CHENNAI: 0,
        DAEGU: 0,
        TIANJIN: 0,
        POITIERS: 0,
        FRANKFURT: 2,
        SCEET: 0,
        SAME: 1,
        AMIENS: 0,
        ANHUI: 0,
        total: 7,
      },
      {
        month: "Nov",
        MONTERREY: 0,
        Kunshan: 0,
        CHENNAI: 1,
        DAEGU: 0,
        TIANJIN: 1,
        POITIERS: 0,
        FRANKFURT: 2,
        SCEET: 1,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 1,
        total: 6,
      },
      {
        month: "Déc",
        MONTERREY: 4,
        Kunshan: 0,
        CHENNAI: 0,
        DAEGU: 0,
        TIANJIN: 0,
        POITIERS: 0,
        FRANKFURT: 0,
        SCEET: 2,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 1,
        total: 9,
      },
    ],
    [],
  );

  const totalByPlant = useMemo(
    () => [
      { plant: "AMIENS", count: 1 },
      { plant: "POITIERS", count: 3 },
      { plant: "SAME", count: 4 },
      { plant: "Kunshan", count: 6 },
      { plant: "ANHUI", count: 7 },
      { plant: "DAEGU", count: 7 },
      { plant: "TIANJIN", count: 11 },
      { plant: "CHENNAI", count: 11 },
      { plant: "MONTERREY", count: 23 },
      { plant: "SCEET", count: 29 },
      { plant: "FRANKFURT", count: 45 },
    ],
    [],
  );

  // Nouveau: Claims by plant with customer breakdown (stacked)
  const claimsByPlantCustomer = useMemo(
    () => [
      {
        plant: "AMIENS",
        customer1: 1,
        customer2: 0,
        customer3: 0,
        customer4: 0,
        customer5: 0,
      },
      {
        plant: "POITIERS",
        customer1: 1,
        customer2: 1,
        customer3: 1,
        customer4: 0,
        customer5: 0,
      },
      {
        plant: "SAME",
        customer1: 3,
        customer2: 1,
        customer3: 0,
        customer4: 0,
        customer5: 0,
      },
      {
        plant: "Kunshan",
        customer1: 2,
        customer2: 2,
        customer3: 1,
        customer4: 1,
        customer5: 0,
      },
      {
        plant: "ANHUI",
        customer1: 2,
        customer2: 2,
        customer3: 1,
        customer4: 1,
        customer5: 1,
      },
      {
        plant: "DAEGU",
        customer1: 3,
        customer2: 2,
        customer3: 1,
        customer4: 1,
        customer5: 0,
      },
      {
        plant: "TIANJIN",
        customer1: 6,
        customer2: 2,
        customer3: 1,
        customer4: 1,
        customer5: 1,
      },
      {
        plant: "CHENNAI",
        customer1: 6,
        customer2: 2,
        customer3: 1,
        customer4: 1,
        customer5: 1,
      },
      {
        plant: "MONTERREY",
        customer1: 11,
        customer2: 6,
        customer3: 3,
        customer4: 2,
        customer5: 1,
      },
      {
        plant: "SCEET",
        customer1: 6,
        customer2: 6,
        customer3: 4,
        customer4: 4,
        customer5: 9,
      },
      {
        plant: "FRANKFURT",
        customer1: 3,
        customer2: 5,
        customer3: 8,
        customer4: 10,
        customer5: 19,
      },
    ],
    [],
  );

  // Nouveau: Customer VS AvoCarbon Sites (simplified from image)
  const customerVsAvoCarbon = useMemo(
    () => [
      {
        customer: "OTHERS",
        MONTERREY: 1,
        Kunshan: 0,
        CHENNAI: 0,
        DAEGU: 0,
        TIANJIN: 0,
        POITIERS: 0,
        FRANKFURT: 0,
        SCEET: 0,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 0,
      },
      {
        customer: "Buhler",
        MONTERREY: 0,
        Kunshan: 0,
        CHENNAI: 0,
        DAEGU: 1,
        TIANJIN: 0,
        POITIERS: 0,
        FRANKFURT: 0,
        SCEET: 0,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 0,
      },
      {
        customer: "HUAN",
        MONTERREY: 0,
        Kunshan: 0,
        CHENNAI: 1,
        DAEGU: 0,
        TIANJIN: 0,
        POITIERS: 0,
        FRANKFURT: 0,
        SCEET: 0,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 0,
      },
      {
        customer: "Changsha Valeo",
        MONTERREY: 0,
        Kunshan: 0,
        CHENNAI: 1,
        DAEGU: 0,
        TIANJIN: 0,
        POITIERS: 0,
        FRANKFURT: 0,
        SCEET: 0,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 1,
      },
      {
        customer: "Bosch",
        MONTERREY: 1,
        Kunshan: 0,
        CHENNAI: 1,
        DAEGU: 0,
        TIANJIN: 0,
        POITIERS: 0,
        FRANKFURT: 1,
        SCEET: 0,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 0,
      },
      {
        customer: "AVO Mexico",
        MONTERREY: 2,
        Kunshan: 0,
        CHENNAI: 0,
        DAEGU: 0,
        TIANJIN: 1,
        POITIERS: 0,
        FRANKFURT: 1,
        SCEET: 1,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 0,
      },
      {
        customer: "AVO Tianjin",
        MONTERREY: 0,
        Kunshan: 0,
        CHENNAI: 0,
        DAEGU: 0,
        TIANJIN: 2,
        POITIERS: 0,
        FRANKFURT: 2,
        SCEET: 0,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 0,
      },
      {
        customer: "AVO Kunshan",
        MONTERREY: 0,
        Kunshan: 2,
        CHENNAI: 0,
        DAEGU: 1,
        TIANJIN: 1,
        POITIERS: 0,
        FRANKFURT: 2,
        SCEET: 2,
        SAME: 0,
        AMIENS: 0,
        ANHUI: 1,
      },
      {
        customer: "AVO Auto",
        MONTERREY: 3,
        Kunshan: 1,
        CHENNAI: 2,
        DAEGU: 1,
        TIANJIN: 1,
        POITIERS: 0,
        FRANKFURT: 5,
        SCEET: 4,
        SAME: 1,
        AMIENS: 0,
        ANHUI: 2,
      },
      {
        customer: "AVO Carbon",
        MONTERREY: 5,
        Kunshan: 1,
        CHENNAI: 3,
        DAEGU: 2,
        TIANJIN: 3,
        POITIERS: 1,
        FRANKFURT: 8,
        SCEET: 8,
        SAME: 1,
        AMIENS: 1,
        ANHUI: 2,
      },
    ],
    [],
  );

  // Nouveau: CSI/CSII monthly data
  const csiCsiiMonthly = useMemo(
    () => [
      { month: "Jan", C2: 4, C1: 4, WR: 0, QualityAlert: 1 },
      { month: "Fév", C2: 5, C1: 3, WR: 1, QualityAlert: 0 },
      { month: "Mar", C2: 7, C1: 3, WR: 0, QualityAlert: 2 },
      { month: "Avr", C2: 5, C1: 2, WR: 2, QualityAlert: 1 },
      { month: "Mai", C2: 6, C1: 2, WR: 2, QualityAlert: 3 },
      { month: "Jun", C2: 3, C1: 5, WR: 1, QualityAlert: 1 },
      { month: "Jul", C2: 4, C1: 3, WR: 1, QualityAlert: 10 },
      { month: "Aoû", C2: 5, C1: 3, WR: 2, QualityAlert: 4 },
      { month: "Sep", C2: 7, C1: 3, WR: 4, QualityAlert: 0 },
      { month: "Oct", C2: 9, C1: 6, WR: 2, QualityAlert: 3 },
      { month: "Nov", C2: 4, C1: 2, WR: 2, QualityAlert: 3 },
      { month: "Déc", C2: 4, C1: 2, WR: 0, QualityAlert: 0 },
    ],
    [],
  );

  const delayTime = useMemo(
    () => [
      {
        plant: "TIANJIN",
        d13: hmsToSeconds("00:00:00"),
        d15: hmsToSeconds("00:00:00"),
        d18: hmsToSeconds("00:00:00"),
        llc: hmsToSeconds("00:00:00"),
      },
      {
        plant: "FRANKFURT",
        d13: hmsToSeconds("00:00:00"),
        d15: hmsToSeconds("3235:10:12"),
        d18: hmsToSeconds("3761:37:46"),
        llc: hmsToSeconds("00:00:00"),
      },
      {
        plant: "SCEET",
        d13: hmsToSeconds("121:06:29"),
        d15: hmsToSeconds("776:23:07"),
        d18: hmsToSeconds("1972:40:32"),
        llc: hmsToSeconds("00:00:00"),
      },
      {
        plant: "CHENNAI",
        d13: hmsToSeconds("77:41:07"),
        d15: hmsToSeconds("00:00:00"),
        d18: hmsToSeconds("00:00:00"),
        llc: hmsToSeconds("00:00:00"),
      },
      {
        plant: "ANHUI",
        d13: hmsToSeconds("00:00:00"),
        d15: hmsToSeconds("00:00:00"),
        d18: hmsToSeconds("00:00:00"),
        llc: hmsToSeconds("00:00:00"),
      },
      {
        plant: "Kunshan",
        d13: hmsToSeconds("00:00:05"),
        d15: hmsToSeconds("00:00:00"),
        d18: hmsToSeconds("3667:10:47"),
        llc: hmsToSeconds("00:00:00"),
      },
      {
        plant: "DAEGU",
        d13: hmsToSeconds("00:00:00"),
        d15: hmsToSeconds("00:00:00"),
        d18: hmsToSeconds("2883:58:49"),
        llc: hmsToSeconds("00:00:00"),
      },
      {
        plant: "MONTERREY",
        d13: hmsToSeconds("00:00:00"),
        d15: hmsToSeconds("374:17:33"),
        d18: hmsToSeconds("716:19:42"),
        llc: hmsToSeconds("00:00:00"),
      },
      {
        plant: "POITIERS",
        d13: hmsToSeconds("198:42:19"),
        d15: hmsToSeconds("00:00:00"),
        d18: hmsToSeconds("00:00:00"),
        llc: hmsToSeconds("00:00:00"),
      },
      {
        plant: "SAME",
        d13: hmsToSeconds("73:00:00"),
        d15: hmsToSeconds("00:00:00"),
        d18: hmsToSeconds("00:00:00"),
        llc: hmsToSeconds("00:00:00"),
      },
      {
        plant: "AMIENS",
        d13: hmsToSeconds("00:00:00"),
        d15: hmsToSeconds("00:00:00"),
        d18: hmsToSeconds("00:00:00"),
        llc: hmsToSeconds("00:00:00"),
      },
    ],
    [],
  );

  const defectType = useMemo(
    () => [
      { type: "Fit", count: 5 },
      { type: "NA", count: 16 },
      { type: "Apparance", count: 27 },
      { type: "Dimensional", count: 28 },
      { type: "Function", count: 70 },
    ],
    [],
  );

  const productType = useMemo(
    () => [
      { type: "SEAL", count: 1 },
      { type: "CHOKE", count: 10 },
      { type: "ASSEMBLY", count: 58 },
      { type: "BRUSH", count: 78 },
    ],
    [],
  );

  const costD13 = useMemo(
    () => [
      { name: "CHENNAI", value: 39.4 },
      { name: "ANHUI", value: 35.3 },
      { name: "SCEET", value: 23.4 },
      { name: "Kunshan", value: 1.0 },
      { name: "FRANKFURT", value: 0.9 },
    ],
    [],
  );

  const costD45 = useMemo(
    () => [
      { name: "CHENNAI", value: 60.7 },
      { name: "SCEET", value: 34.4 },
      { name: "ANHUI", value: 4.5 },
      { name: "Kunshan", value: 0.4 },
    ],
    [],
  );

  const costD68 = useMemo(
    () => [
      { name: "SCEET", value: 65.3 },
      { name: "Kunshan", value: 16.7 },
      { name: "FRANKFURT", value: 14.0 },
      { name: "ANHUI", value: 2.2 },
      { name: "CHENNAI", value: 1.7 },
    ],
    [],
  );

  const costLLC = useMemo(() => [{ name: "SCEET", value: 100.0 }], []);

  const totalComplaints = 147;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E8EAF6 0%, #F5F7FA 100%)",
        padding: "24px",
      }}
    >
      {/* Header industriel moderne */}
      <AppHeader
        title="Quality Control Dashboard"
        logoSrc={logo}
        actions={
          <>
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
              + Nouvelle réclamation
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
              Liste des réclamations
            </Link>
          </>
        }
      />

      {/* KPI Cards - Style industriel moderne */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
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
            Total Réclamations
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
            Année {year}
          </div>
        </div>

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
            Site prioritaire
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
            FRANKFURT
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
            45 réclamations
          </div>
        </div>

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
            Dernière MàJ
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
            09 Fév 2026
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
            11:53
          </div>
        </div>
      </div>

      {/* Section principale avec graphiques */}
      <div style={{ display: "grid", gap: 24 }}>
        {/* Réclamations mensuelles */}
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
                  Évolution mensuelle des réclamations
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#78909C",
                    margin: "4px 0 0 0",
                  }}
                >
                  Distribution par site de production (stacked view)
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

        {/* Deux colonnes : Total par plant + avec breakdown clients */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          {/* Total par plant - simple */}
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
                ></div>
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: INDUSTRIAL_COLORS.primary,
                    }}
                  >
                    Total réclamations par usine
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#78909C",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Classement des sites
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

          {/* Total par plant avec breakdown clients (stacked) */}
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
                ></div>
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: INDUSTRIAL_COLORS.primary,
                    }}
                  >
                    Origine: Usine vs Client
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#78909C",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Breakdown par client
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
                      name="Client principal"
                      fill="#4A7CFF"
                    />
                    <Bar
                      dataKey="customer2"
                      stackId="a"
                      name="Client 2"
                      fill="#7ED321"
                    />
                    <Bar
                      dataKey="customer3"
                      stackId="a"
                      name="Client 3"
                      fill="#FF8C42"
                    />
                    <Bar
                      dataKey="customer4"
                      stackId="a"
                      name="Client 4"
                      fill="#9B59B6"
                    />
                    <Bar
                      dataKey="customer5"
                      stackId="a"
                      name="Autres"
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
              ></div>
              <div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    color: INDUSTRIAL_COLORS.primary,
                  }}
                >
                  Clients vs Sites AvoCarbon
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#78909C",
                    margin: "4px 0 0 0",
                  }}
                >
                  Distribution des réclamations par client et site de production
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

        {/* CSI/CSII + Delay Time */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          {/* CSI/CSII */}
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
                ></div>
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: INDUSTRIAL_COLORS.primary,
                    }}
                  >
                    CSI et CSII mensuels
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#78909C",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Classification par type
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ width: "100%", height: 340 }}>
                <ResponsiveContainer>
                  <BarChart data={csiCsiiMonthly}>
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
                    <Bar dataKey="C2" stackId="a" name="C2" fill="#FF8C42" />
                    <Bar dataKey="C1" stackId="a" name="C1" fill="#27AE60" />
                    <Bar dataKey="WR" stackId="a" name="WR" fill="#E74C3C" />
                    <Bar
                      dataKey="QualityAlert"
                      stackId="a"
                      name="Quality Alert"
                      fill="#9B59B6"
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
                ></div>
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: INDUSTRIAL_COLORS.primary,
                    }}
                  >
                    Temps de traitement
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
                <ResponsiveContainer>
                  <BarChart data={delayTime}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E0E0E0"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="plant"
                      tick={{ fill: "#78909C", fontSize: 11, fontWeight: 600 }}
                      tickLine={{ stroke: "#E0E0E0" }}
                      axisLine={{ stroke: "#E0E0E0" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tickFormatter={secondsToHmsShort}
                      tick={{ fill: "#78909C", fontSize: 12, fontWeight: 600 }}
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
                ></div>
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: INDUSTRIAL_COLORS.primary,
                    }}
                  >
                    Type de défaut
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#78909C",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Classification qualité
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={defectType}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E0E0E0"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="type"
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
                ></div>
                <div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: INDUSTRIAL_COLORS.primary,
                    }}
                  >
                    Type de produit
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#78909C",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Catégories de produits
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={productType}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E0E0E0"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="type"
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
              </div>
            </div>
          </div>
        </div>

        {/* Cost Distribution */}
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
                  Distribution des coûts par phase
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#78909C",
                    margin: "4px 0 0 0",
                  }}
                >
                  Répartition en pourcentage (D1-D3 / D4-D5 / D6-D8 / LLC)
                </p>
              </div>
            </div>
          </div>
          <div style={{ padding: 32 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 32,
              }}
            >
              {[
                { data: costD13, title: "D1–D3", color: "#4A7CFF" },
                { data: costD45, title: "D4–D5", color: "#27AE60" },
                { data: costD68, title: "D6–D8", color: "#E74C3C" },
                { data: costLLC, title: "LLC", color: "#F39C12" },
              ].map(({ data, title, color }) => (
                <div key={title}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        background: color,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {title.split("–")[0]}
                    </div>
                    <h4
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        margin: 0,
                        color: INDUSTRIAL_COLORS.primary,
                      }}
                    >
                      {title}
                    </h4>
                  </div>
                  <div style={{ width: "100%", height: 240 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Tooltip
                          formatter={(v: any) => `${v}%`}
                          contentStyle={{
                            background: "rgba(255,255,255,0.98)",
                            border: `2px solid ${color}`,
                            borderRadius: 12,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                            padding: "12px 16px",
                          }}
                        />
                        <Pie
                          data={data}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          label={({ value }) => `${value}%`}
                          labelLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
                        >
                          {data.map((entry, i) => (
                            <Cell
                              key={i}
                              fill={PLANT_COLORS[entry.name as Plant] || color}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
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
            Système de gestion qualité industriel
          </div>
          <div style={{ fontSize: 13, color: "#78909C" }}>
            Dashboard temps réel • Données consolidées et mises à jour
            automatiquement • Export disponible
          </div>
        </div>
      </div>
    </div>
  );
}
