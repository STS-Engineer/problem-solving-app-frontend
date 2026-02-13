import StepLayout from "../../StepLayout";
import { STEPS } from "../../../lib/steps";
import { useStepData } from "../../../hooks/useStepData";

interface CorrectiveAction {
  action: string;
  responsible: string;
  due_date: string;
  imp_date: string;
  evidence: string;
}

interface D5FormData {
  corrective_actions_occurrence: CorrectiveAction[];
  corrective_actions_detection: CorrectiveAction[];
}

const emptyAction: CorrectiveAction = {
  action: "",
  responsible: "",
  due_date: "",
  imp_date: "",
  evidence: "",
};

export default function D5({ onRefreshSteps }: { onRefreshSteps: () => void }) {
  const meta = STEPS.find((s) => s.code === "D5")!;

  const { loading, saving, data, setData, handleSaveDraft, handleSubmit } =
    useStepData<D5FormData>("D5", {
      corrective_actions_occurrence: [
        { ...emptyAction },
        { ...emptyAction },
        { ...emptyAction },
      ],
      corrective_actions_detection: [
        { ...emptyAction },
        { ...emptyAction },
        { ...emptyAction },
      ],
    });

  const submit = async () => {
    const filteredData = {
      corrective_actions_occurrence: data.corrective_actions_occurrence.filter(
        (action) =>
          action.action.trim() ||
          action.responsible.trim() ||
          action.due_date ||
          action.imp_date ||
          action.evidence.trim(),
      ),
      corrective_actions_detection: data.corrective_actions_detection.filter(
        (action) =>
          action.action.trim() ||
          action.responsible.trim() ||
          action.due_date ||
          action.imp_date ||
          action.evidence.trim(),
      ),
    };

    // Si aucune action n'a été remplie, garder au moins un objet vide pour la structure
    if (filteredData.corrective_actions_occurrence.length === 0) {
      filteredData.corrective_actions_occurrence = [{ ...emptyAction }];
    }
    if (filteredData.corrective_actions_detection.length === 0) {
      filteredData.corrective_actions_detection = [{ ...emptyAction }];
    }

    // Mettre à jour les données avant soumission
    setData(filteredData);

    // Attendre que le state soit mis à jour
    await new Promise((resolve) => setTimeout(resolve, 100));

    await handleSubmit();
    onRefreshSteps();
  };
  const updateOccurrenceAction = (
    index: number,
    field: keyof CorrectiveAction,
    value: string,
  ) => {
    const updated = [...data.corrective_actions_occurrence];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, corrective_actions_occurrence: updated });
  };

  const updateDetectionAction = (
    index: number,
    field: keyof CorrectiveAction,
    value: string,
  ) => {
    const updated = [...data.corrective_actions_detection];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, corrective_actions_detection: updated });
  };

  const addOccurrenceAction = () => {
    setData({
      ...data,
      corrective_actions_occurrence: [
        ...data.corrective_actions_occurrence,
        { ...emptyAction },
      ],
    });
  };

  const addDetectionAction = () => {
    setData({
      ...data,
      corrective_actions_detection: [
        ...data.corrective_actions_detection,
        { ...emptyAction },
      ],
    });
  };

  const removeOccurrenceAction = (index: number) => {
    if (data.corrective_actions_occurrence.length <= 1) return;
    const updated = data.corrective_actions_occurrence.filter(
      (_, i) => i !== index,
    );
    setData({ ...data, corrective_actions_occurrence: updated });
  };

  const removeDetectionAction = (index: number) => {
    if (data.corrective_actions_detection.length <= 1) return;
    const updated = data.corrective_actions_detection.filter(
      (_, i) => i !== index,
    );
    setData({ ...data, corrective_actions_detection: updated });
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
      {/* Section I - Corrective Action for Occurrence */}
      <div className="section">
        <h3>CORRECTIVE ACTION</h3>

        <h4 className="font-semibold text-gray-700 mb-3">
          I. Corrective Action for Occurrence
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[250px] bg-blue-50">Action</th>
                  <th className="min-w-[150px] bg-green-50">Responsible</th>
                  <th className="min-w-[130px] bg-amber-50">Due Date</th>
                  <th className="min-w-[130px] bg-purple-50">Imp Date</th>
                  <th className="min-w-[200px] bg-indigo-50">Evidence</th>
                  <th className="min-w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.corrective_actions_occurrence.map((action, index) => (
                  <tr key={index}>
                    <td className="bg-blue-50/30">
                      <input
                        placeholder="Corrective action description..."
                        className="w-full font-medium"
                        value={action.action}
                        onChange={(e) =>
                          updateOccurrenceAction(
                            index,
                            "action",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="bg-green-50/30">
                      <input
                        placeholder="Name..."
                        className="w-full font-medium"
                        value={action.responsible}
                        onChange={(e) =>
                          updateOccurrenceAction(
                            index,
                            "responsible",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="bg-amber-50/30">
                      <input
                        type="date"
                        className="w-full font-medium"
                        value={action.due_date}
                        onChange={(e) =>
                          updateOccurrenceAction(
                            index,
                            "due_date",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="bg-purple-50/30">
                      <input
                        type="date"
                        className="w-full font-medium"
                        value={action.imp_date}
                        onChange={(e) =>
                          updateOccurrenceAction(
                            index,
                            "imp_date",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="bg-indigo-50/30">
                      <input
                        placeholder="Evidence file/reference..."
                        className="w-full font-medium"
                        value={action.evidence}
                        onChange={(e) =>
                          updateOccurrenceAction(
                            index,
                            "evidence",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td>
                      {data.corrective_actions_occurrence.length > 1 && (
                        <button
                          onClick={() => removeOccurrenceAction(index)}
                          style={{
                            background: "#E74C3C",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 12px",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={addOccurrenceAction}
            className="btn hover:scale-105 transition-transform text-sm"
          >
            <span>➕</span>
            <span>Add action</span>
          </button>
        </div>
      </div>

      {/* Section II - Corrective Action for Detection */}
      <div className="section">
        <h4 className="font-semibold text-gray-700 mb-3">
          II. Corrective Action for Detection
        </h4>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="min-w-[250px] bg-blue-50">Action</th>
                  <th className="min-w-[150px] bg-green-50">Responsible</th>
                  <th className="min-w-[130px] bg-amber-50">Due Date</th>
                  <th className="min-w-[130px] bg-purple-50">Imp Date</th>
                  <th className="min-w-[200px] bg-indigo-50">Evidence</th>
                  <th className="min-w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.corrective_actions_detection.map((action, index) => (
                  <tr key={index}>
                    <td className="bg-blue-50/30">
                      <input
                        placeholder="Detection action description..."
                        className="w-full font-medium"
                        value={action.action}
                        onChange={(e) =>
                          updateDetectionAction(index, "action", e.target.value)
                        }
                      />
                    </td>
                    <td className="bg-green-50/30">
                      <input
                        placeholder="Name..."
                        className="w-full font-medium"
                        value={action.responsible}
                        onChange={(e) =>
                          updateDetectionAction(
                            index,
                            "responsible",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="bg-amber-50/30">
                      <input
                        type="date"
                        className="w-full font-medium"
                        value={action.due_date}
                        onChange={(e) =>
                          updateDetectionAction(
                            index,
                            "due_date",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="bg-purple-50/30">
                      <input
                        type="date"
                        className="w-full font-medium"
                        value={action.imp_date}
                        onChange={(e) =>
                          updateDetectionAction(
                            index,
                            "imp_date",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="bg-indigo-50/30">
                      <input
                        placeholder="Evidence file/reference..."
                        className="w-full font-medium"
                        value={action.evidence}
                        onChange={(e) =>
                          updateDetectionAction(
                            index,
                            "evidence",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td>
                      {data.corrective_actions_detection.length > 1 && (
                        <button
                          onClick={() => removeDetectionAction(index)}
                          style={{
                            background: "#E74C3C",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 12px",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={addDetectionAction}
            className="btn hover:scale-105 transition-transform text-sm"
          >
            <span>➕</span>
            <span>Add action</span>
          </button>
        </div>
      </div>
    </StepLayout>
  );
}
