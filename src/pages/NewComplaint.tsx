// src/pages/NewComplaint.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createComplaintWith8D } from "../services/api/complaint";
import logo from "../assets/images/logo-avocarbon.png";
import AppHeader from "../components/AppHeader";
import toast from "react-hot-toast";

const INDUSTRIAL_COLORS = {
  primary: "#2C3E50",
  secondary: "#34495E",
  accent: "#4A7CFF",
  success: "#27AE60",
  warning: "#F39C12",
  danger: "#E74C3C",
  info: "#3498DB",
  border: "#BDC3C7",
};

export default function NewComplaint() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État du formulaire
  const [formData, setFormData] = useState({
    complaint_name: "",
    quality_issue_warranty: "",
    customer: "",
    customer_plant_name: "",
    avocarbon_plant: "",
    avocarbon_product_type: "",
    potential_avocarbon_process_linked_to_problem: "",
    product_line: "",
    concerned_application: "",
    customer_complaint_date: "",
    complaint_opening_date: new Date().toISOString().split("T")[0],
    complaint_description: "",
    defects: "",
    quality_manager: 1, // TODO: Récupérer le vrai ID
    repetitive_complete_with_number: "0",
    reported_by: 1, // TODO: Récupérer l'utilisateur connecté
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validation basique
      if (
        !formData.complaint_name ||
        !formData.customer ||
        !formData.avocarbon_plant ||
        !formData.product_line
      ) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }
      console.log("Données du formulaire:", formData);
      let result;

      // Créer avec rapport 8D
      result = await createComplaintWith8D(formData);
      console.log("Réclamation créée avec rapport 8D:", result);
      toast.success("Complaint created successfully!");

      // Rediriger vers D1 - le rapport a été créé automatiquement
      nav(`/8d/${result.id}/D1`);
      // } else {
      //   // Créer seulement la plainte
      //   result = await createComplaintDraft(formData);
      //   alert("Brouillon sauvegardé avec succès!");
      //   nav("/complaints");
      // }
    } catch (err: any) {
      console.error("Erreur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E8EAF6 0%, #F5F7FA 100%)",
        padding: "24px",
      }}
    >
      <AppHeader
        title="Create Customer complaint"
        logoSrc={logo}
        actions={
          <button
            onClick={() => nav("/complaints")}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              padding: "12px 24px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
            }}
          >
            ← Return
          </button>
        }
      />

      {/* Affichage des erreurs */}
      {error && (
        <div
          style={{
            background: "#fee",
            border: "2px solid #fcc",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            color: "#c33",
            fontWeight: 600,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div
        style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #E0E0E0",
          overflow: "hidden",
        }}
      >
        {/* Informations de base */}
        <div style={{ padding: "32px", borderBottom: "1px solid #E0E0E0" }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 24,
              color: INDUSTRIAL_COLORS.primary,
            }}
          >
            Base informations
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#78909C",
                  marginBottom: 8,
                }}
              >
                Problem type
                <span style={{ fontSize: 15, color: "#c33" }}> *</span>
              </label>
              <select
                name="quality_issue_warranty"
                value={formData.quality_issue_warranty}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              >
                <option value="">Select...</option>
                <option value="CS2">🔴 CS2 - Critique</option>
                <option value="CS1">🟡 CS1 - Majeur</option>
                <option value="WR">🟢 WR - Warranty</option>
                <option value="Quality Alert">⚡ Quality Alert</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#78909C",
                  marginBottom: 8,
                }}
              >
                Customer Complaint date{" "}
                <span style={{ fontSize: 15, color: "#c33" }}> *</span>
              </label>
              <input
                type="date"
                name="customer_complaint_date"
                value={formData.customer_complaint_date}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#78909C",
                  marginBottom: 8,
                }}
              >
                Open Date{" "}
                <span style={{ fontSize: 15, color: "#c33" }}> *</span>
              </label>
              <input
                type="date"
                name="complaint_opening_date"
                value={formData.complaint_opening_date}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginTop: 20,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#78909C",
                  marginBottom: 8,
                }}
              >
                Customer <span style={{ fontSize: 15, color: "#c33" }}> *</span>
              </label>
              <input
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                placeholder="Ex: Renault..."
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#78909C",
                  marginBottom: 8,
                }}
              >
                Customer Plant{" "}
                <span style={{ fontSize: 15, color: "#c33" }}> *</span>
              </label>
              <input
                type="text"
                name="customer_plant_name"
                value={formData.customer_plant_name}
                onChange={handleChange}
                placeholder="Ex: Renault Flins..."
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Détails Produit */}
        <div style={{ padding: "32px", borderBottom: "1px solid #E0E0E0" }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 24,
              color: INDUSTRIAL_COLORS.primary,
            }}
          >
            Product & Process details
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#78909C",
                  marginBottom: 8,
                }}
              >
                AVOCarbon Plant{" "}
                <span style={{ fontSize: 15, color: "#c33" }}> *</span>
              </label>
              <select
                name="avocarbon_plant"
                value={formData.avocarbon_plant}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              >
                <option value="">Select...</option>
                <option value="MONTERREY">🇲🇽 MONTERREY</option>
                <option value="KUNSHAN">🇨🇳 Kunshan</option>
                <option value="CHENNAI">🇮🇳 CHENNAI</option>
                <option value="POITIERS">🇫🇷 POITIERS</option>
                <option value="same">🇹🇳 SAME</option>
                <option value="nadhour">🇹🇳 NADHOUR</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#78909C",
                  marginBottom: 8,
                }}
              >
                Product Line{" "}
                <span style={{ fontSize: 15, color: "#c33" }}> *</span>
              </label>
              <select
                name="product_line"
                value={formData.product_line}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              >
                <option value="">Select...</option>
                <option value="CHOKE">CHOKE</option>
                <option value="ASSEMBLY">ASSEMBLY</option>
                <option value="SEAL">SEAL</option>
                <option value="FRICTION">FRICTION</option>
                <option value="BRUSH">BRUSH</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#78909C",
                  marginBottom: 8,
                }}
              >
                Product type{" "}
                <span style={{ fontSize: 15, color: "#c33" }}> *</span>
              </label>
              <input
                type="text"
                name="avocarbon_product_type"
                value={formData.avocarbon_product_type}
                onChange={handleChange}
                placeholder="Ex: BRUSH CARD..."
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginTop: 20,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#78909C",
                  marginBottom: 8,
                }}
              >
                Process linked to the problem{" "}
                <span style={{ fontSize: 15, color: "#c33" }}> *</span>
              </label>
              <input
                type="text"
                name="potential_avocarbon_process_linked_to_problem"
                value={formData.potential_avocarbon_process_linked_to_problem}
                onChange={handleChange}
                placeholder="Ex: GRINDING..."
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#78909C",
                  marginBottom: 8,
                }}
              >
                Concerned Application{" "}
                <span style={{ fontSize: 15, color: "#c33" }}> *</span>
              </label>
              <input
                type="text"
                name="concerned_application"
                value={formData.concerned_application}
                onChange={handleChange}
                placeholder="Ex: FrontWiper..."
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Description du Défaut */}
        <div style={{ padding: "32px", borderBottom: "1px solid #E0E0E0" }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 24,
              color: INDUSTRIAL_COLORS.primary,
            }}
          >
            Defect Description{" "}
            <span style={{ fontSize: 15, color: "#c33" }}> *</span>
          </h3>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#78909C",
                  marginBottom: 8,
                }}
              >
                Short Description{" "}
                <span style={{ fontSize: 15, color: "#c33" }}> *</span>
              </label>
              <input
                type="text"
                name="complaint_name"
                value={formData.complaint_name}
                onChange={handleChange}
                placeholder="Ex: Fissure post-soudure..."
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#78909C",
                  marginBottom: 8,
                }}
              >
                Defect Type{" "}
                <span style={{ fontSize: 15, color: "#c33" }}> *</span>
              </label>
              <select
                name="defects"
                value={formData.defects}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              >
                <option value="">Select...</option>
                <option value="Function">Function</option>
                <option value="Fit">Fit</option>
                <option value="Dimensional">Dimensional</option>
                <option value="Appearance">Appearance</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#78909C",
                marginBottom: 8,
              }}
            >
              Detailed Description{" "}
              <span style={{ fontSize: 15, color: "#c33" }}> *</span>
            </label>
            <textarea
              name="complaint_description"
              value={formData.complaint_description}
              onChange={handleChange}
              placeholder="Describe in details the problem..."
              rows={5}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: `2px solid ${INDUSTRIAL_COLORS.border}`,
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: "24px 32px",
            background: "#F8F9FA",
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button
            onClick={() => nav("/complaints")}
            disabled={loading}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: `2px solid ${INDUSTRIAL_COLORS.border}`,
              background: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            ✕ Cancel
          </button>
          {/* 
          <button
            onClick={() => handleSubmit()}
            disabled={loading}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background: "#95A5A6",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            💾 {loading ? "Enregistrement..." : "Enregistrer brouillon"}
          </button> */}

          <button
            onClick={() => handleSubmit()}
            disabled={loading}
            style={{
              padding: "12px 28px",
              borderRadius: 8,
              border: "none",
              background: INDUSTRIAL_COLORS.accent,
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Creation..." : "Create and Start 8D"}
          </button>
        </div>
      </div>
    </div>
  );
}
