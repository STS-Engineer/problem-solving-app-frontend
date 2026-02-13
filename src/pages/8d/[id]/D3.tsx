// src/pages/8d/[id]/D3.tsx
import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { useEffect, useState } from "react";
import { useStepData } from "../../../hooks/useStepData";

type SuspectedLocation =
  | "supplier_site"
  | "in_transit"
  | "production_floor"
  | "warehouse"
  | "customer_site"
  | "others";

interface DefectedPartStatus {
  returned: boolean;
  isolated: boolean;
  isolated_location: string;
  identified: boolean;
  identified_method: string;
}

interface SuspectedPartsRow {
  location: SuspectedLocation;
  inventory: string;
  actions: string;
  leader: string;
  results: string;
}

interface AlertCommunicatedTo {
  production_shift_leaders: boolean;
  quality_control: boolean;
  warehouse: boolean;
  maintenance: boolean;
  customer_contact: boolean;
  production_planner: boolean;
}

interface RestartProduction {
  when: string; // Date, Time, Lot
  first_certified_lot: string;
  approved_by: string;
  method: string;
  identification: string;
}

interface D3FormData {
  defected_part_status: DefectedPartStatus;
  suspected_parts_status: SuspectedPartsRow[];
  alert_communicated_to: AlertCommunicatedTo;
  alert_number: string;
  restart_production: RestartProduction;
  containment_responsible: string;
}

const DEFAULT_SUSPECTED: SuspectedPartsRow[] = [
  {
    location: "supplier_site",
    inventory: "",
    actions: "",
    leader: "",
    results: "",
  },
  {
    location: "in_transit",
    inventory: "",
    actions: "",
    leader: "",
    results: "",
  },
  {
    location: "production_floor",
    inventory: "",
    actions: "",
    leader: "",
    results: "",
  },
  {
    location: "warehouse",
    inventory: "",
    actions: "",
    leader: "",
    results: "",
  },
  {
    location: "customer_site",
    inventory: "",
    actions: "",
    leader: "",
    results: "",
  },
  { location: "others", inventory: "", actions: "", leader: "", results: "" },
];

export default function D3({ onRefreshSteps }: { onRefreshSteps: () => void }) {
  const meta = STEPS.find((s) => s.code === "D3")!;

  // ✅ Same backend wiring as D1
  const { loading, saving, data, setData, handleSaveDraft, handleSubmit } =
    useStepData<D3FormData>("D3", {
      defected_part_status: {
        returned: false,
        isolated: false,
        isolated_location: "",
        identified: false,
        identified_method: "",
      },
      suspected_parts_status: DEFAULT_SUSPECTED,
      alert_communicated_to: {
        production_shift_leaders: false,
        quality_control: false,
        warehouse: false,
        maintenance: false,
        customer_contact: false,
        production_planner: false,
      },
      alert_number: "",
      restart_production: {
        when: "",
        first_certified_lot: "",
        approved_by: "",
        method: "",
        identification: "",
      },
      containment_responsible: "",
    });

  // Keep your local states (minimal disruption), but sync them with step data.
  const [returned, setReturned] = useState(false);
  const [isolated, setIsolated] = useState(false);
  const [identified, setIdentified] = useState(false);

  // ✅ When backend data loads, reflect it in the existing local states
  useEffect(() => {
    const d = data?.defected_part_status;
    if (!d) return;
    setReturned(!!d.returned);
    setIsolated(!!d.isolated);
    setIdentified(!!d.identified);
  }, [data?.defected_part_status]);

  const setDefected = (patch: Partial<DefectedPartStatus>) => {
    setData({
      ...data,
      defected_part_status: {
        ...data.defected_part_status,
        ...patch,
      },
    });
  };

  const setSuspectedRow = (
    location: SuspectedLocation,
    field: keyof Omit<SuspectedPartsRow, "location">,
    value: string,
  ) => {
    const updated = data.suspected_parts_status.map((r) =>
      r.location === location ? { ...r, [field]: value } : r,
    );
    setData({ ...data, suspected_parts_status: updated });
  };

  const setAlertTo = (key: keyof AlertCommunicatedTo, value: boolean) => {
    setData({
      ...data,
      alert_communicated_to: {
        ...data.alert_communicated_to,
        [key]: value,
      },
    });
  };

  const submit = async () => {
    await handleSubmit();
    onRefreshSteps();
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>⏳ Loading...</div>
    );
  }

  return (
    <StepLayout
      meta={meta}
      onSaveDraft={handleSaveDraft}
      onSubmit={submit}
      saving={saving}
    >
      {/* Section I - Defected Part Status */}
      <div className="section">
        <h3>Containment Actions</h3>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-3">
            I. Defected part status
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="field space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={returned}
                  onChange={(e) => {
                    const v = e.target.checked;
                    setReturned(v);
                    setDefected({ returned: v });
                  }}
                />
                Is it returned to X?
              </label>
            </div>

            {/* Isolated */}
            <div className="field space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={isolated}
                  onChange={(e) => {
                    const v = e.target.checked;
                    setIsolated(v);
                    setDefected({
                      isolated: v,
                      isolated_location: v
                        ? data.defected_part_status.isolated_location
                        : "",
                    });
                    // if turned off, clear location
                    if (!v) setDefected({ isolated_location: "" });
                  }}
                />
                Is it isolated?
              </label>

              {isolated && (
                <input
                  type="text"
                  placeholder="Location..."
                  className="w-full"
                  value={data.defected_part_status.isolated_location}
                  onChange={(e) =>
                    setDefected({ isolated_location: e.target.value })
                  }
                />
              )}
            </div>

            {/* Identified */}
            <div className="field space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={identified}
                  onChange={(e) => {
                    const v = e.target.checked;
                    setIdentified(v);
                    setDefected({
                      identified: v,
                      identified_method: v
                        ? data.defected_part_status.identified_method
                        : "",
                    });
                    // if turned off, clear method
                    if (!v) setDefected({ identified_method: "" });
                  }}
                />
                Identified to avoid mishandling
              </label>

              {identified && (
                <input
                  type="text"
                  placeholder="Describe identification method..."
                  className="w-full"
                  value={data.defected_part_status.identified_method}
                  onChange={(e) =>
                    setDefected({ identified_method: e.target.value })
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section II - Suspected Parts Status */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          II. Suspected parts status
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[150px]">Location</th>
                  <th className="min-w-[120px]">Inventory</th>
                  <th className="min-w-[200px]">Actions</th>
                  <th className="min-w-[120px]">Leader</th>
                  <th className="min-w-[150px]">Results</th>
                </tr>
              </thead>
              <tbody>
                {/* Supplier site */}
                <tr>
                  <td className="font-semibold bg-gray-50">Supplier site</td>
                  <td>
                    <input
                      type="text"
                      placeholder="Qty..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "supplier_site",
                        )?.inventory ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "supplier_site",
                          "inventory",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Actions taken..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "supplier_site",
                        )?.actions ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "supplier_site",
                          "actions",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Name..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "supplier_site",
                        )?.leader ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "supplier_site",
                          "leader",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Status..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "supplier_site",
                        )?.results ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "supplier_site",
                          "results",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                </tr>

                {/* In Transit */}
                <tr>
                  <td className="font-semibold bg-gray-50">In Transit</td>
                  <td>
                    <input
                      type="text"
                      placeholder="Qty..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "in_transit",
                        )?.inventory ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "in_transit",
                          "inventory",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Actions taken..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "in_transit",
                        )?.actions ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow("in_transit", "actions", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Name..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "in_transit",
                        )?.leader ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow("in_transit", "leader", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Status..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "in_transit",
                        )?.results ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow("in_transit", "results", e.target.value)
                      }
                    />
                  </td>
                </tr>

                {/* In Production floor */}
                <tr>
                  <td className="font-semibold bg-gray-50">
                    In Production floor
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Qty..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "production_floor",
                        )?.inventory ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "production_floor",
                          "inventory",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Actions taken..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "production_floor",
                        )?.actions ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "production_floor",
                          "actions",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Name..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "production_floor",
                        )?.leader ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "production_floor",
                          "leader",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Status..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "production_floor",
                        )?.results ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "production_floor",
                          "results",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                </tr>

                {/* In Warehouse */}
                <tr>
                  <td className="font-semibold bg-gray-50">In Warehouse</td>
                  <td>
                    <input
                      type="text"
                      placeholder="Qty..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "warehouse",
                        )?.inventory ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "warehouse",
                          "inventory",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Actions taken..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "warehouse",
                        )?.actions ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow("warehouse", "actions", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Name..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "warehouse",
                        )?.leader ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow("warehouse", "leader", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Status..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "warehouse",
                        )?.results ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow("warehouse", "results", e.target.value)
                      }
                    />
                  </td>
                </tr>

                {/* In customer site */}
                <tr>
                  <td className="font-semibold bg-gray-50">In customer site</td>
                  <td>
                    <input
                      type="text"
                      placeholder="Qty..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "customer_site",
                        )?.inventory ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "customer_site",
                          "inventory",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Actions taken..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "customer_site",
                        )?.actions ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "customer_site",
                          "actions",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Name..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "customer_site",
                        )?.leader ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "customer_site",
                          "leader",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Status..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "customer_site",
                        )?.results ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow(
                          "customer_site",
                          "results",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                </tr>

                {/* Others */}
                <tr>
                  <td className="font-semibold bg-gray-50">Others</td>
                  <td>
                    <input
                      type="text"
                      placeholder="Qty..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "others",
                        )?.inventory ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow("others", "inventory", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Actions taken..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "others",
                        )?.actions ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow("others", "actions", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Name..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "others",
                        )?.leader ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow("others", "leader", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Status..."
                      className="w-full"
                      value={
                        data.suspected_parts_status.find(
                          (r) => r.location === "others",
                        )?.results ?? ""
                      }
                      onChange={(e) =>
                        setSuspectedRow("others", "results", e.target.value)
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section III - Alert Communicated */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          III. Alert Comunicated to
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={data.alert_communicated_to.production_shift_leaders}
              onChange={(e) =>
                setAlertTo("production_shift_leaders", e.target.checked)
              }
            />
            <span className="text-sm">Production Shift Leaders</span>
          </label>

          <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={data.alert_communicated_to.quality_control}
              onChange={(e) => setAlertTo("quality_control", e.target.checked)}
            />
            <span className="text-sm">Quality Control</span>
          </label>

          <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={data.alert_communicated_to.warehouse}
              onChange={(e) => setAlertTo("warehouse", e.target.checked)}
            />
            <span className="text-sm">Warehouse</span>
          </label>

          <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={data.alert_communicated_to.maintenance}
              onChange={(e) => setAlertTo("maintenance", e.target.checked)}
            />
            <span className="text-sm">Maintenance</span>
          </label>

          <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={data.alert_communicated_to.customer_contact}
              onChange={(e) => setAlertTo("customer_contact", e.target.checked)}
            />
            <span className="text-sm">Customer Contact</span>
          </label>

          <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={data.alert_communicated_to.production_planner}
              onChange={(e) =>
                setAlertTo("production_planner", e.target.checked)
              }
            />
            <span className="text-sm">Production Planner</span>
          </label>
        </div>

        <div className="field">
          <label className="text-sm font-medium">
            Alert # (QRQC log or NCR #):
          </label>
          <input
            type="text"
            placeholder="Reference number..."
            className="w-full font-medium"
            value={data.alert_number}
            onChange={(e) => setData({ ...data, alert_number: e.target.value })}
          />
        </div>
      </div>

      {/* Section IV - Restart Production */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          IV. Restart Production
        </h4>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="field">
              <label className="text-sm font-medium">
                When (Date, Time, Lot)
              </label>
              <input
                type="text"
                placeholder="Date, time, lot number..."
                className="w-full font-medium"
                value={data.restart_production.when}
                onChange={(e) =>
                  setData({
                    ...data,
                    restart_production: {
                      ...data.restart_production,
                      when: e.target.value,
                    },
                  })
                }
              />
            </div>

            <div className="field">
              <label className="text-sm font-medium">First Certified Lot</label>
              <input
                type="text"
                placeholder="Lot number..."
                className="w-full font-medium"
                value={data.restart_production.first_certified_lot}
                onChange={(e) =>
                  setData({
                    ...data,
                    restart_production: {
                      ...data.restart_production,
                      first_certified_lot: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="field">
            <label className="text-sm font-medium">Approved by</label>
            <input
              type="text"
              placeholder="Name and title..."
              className="w-full font-medium"
              value={data.restart_production.approved_by}
              onChange={(e) =>
                setData({
                  ...data,
                  restart_production: {
                    ...data.restart_production,
                    approved_by: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="field">
            <label className="text-sm font-medium">
              Method (Include how many parts, device, characteristics to
              measure, procedure)
            </label>
            <textarea
              placeholder="Describe the verification method..."
              className="w-full"
              rows={3}
              value={data.restart_production.method}
              onChange={(e) =>
                setData({
                  ...data,
                  restart_production: {
                    ...data.restart_production,
                    method: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="field">
            <label className="text-sm font-medium">
              Describe pieces Identification and carton boxes identification
            </label>
            <textarea
              placeholder="Identification method for parts and packaging..."
              className="w-full"
              rows={3}
              value={data.restart_production.identification}
              onChange={(e) =>
                setData({
                  ...data,
                  restart_production: {
                    ...data.restart_production,
                    identification: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Section V - Containment Responsible */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          V. Containment Responsible:
        </h4>

        <div className="field">
          <input
            type="text"
            placeholder="Name and title of responsible person..."
            className="w-full font-medium text-lg"
            value={data.containment_responsible}
            onChange={(e) =>
              setData({ ...data, containment_responsible: e.target.value })
            }
          />
        </div>
      </div>
    </StepLayout>
  );
}
