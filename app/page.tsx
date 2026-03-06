"use client";

import React, { useMemo, useState } from "react";

type Domain = "A" | "B" | "C" | "D" | "E";
type AmberSubtype = "AMBER-GREEN" | "AMBER-AMBER" | "AMBER-RED";
type FinalCategory = "GREEN" | AmberSubtype | "RED";

type TriggerOption = {
  id: string;
  domain: Domain;
  label: string;
  hint?: string;
};

type RedChecklistOption = {
  id: string;
  label: string;
  hint?: string;
};

type TriageResult = {
  category: FinalCategory;
  summary: string;
  triggeredDomains: Domain[];
  triggerLabels: string[];
  redReasons: string[];
  actions: string[];
};

const triggerOptions: TriggerOption[] = [
  { id: "a1", domain: "A", label: "Advanced or metastatic cancer" },
  { id: "a2", domain: "A", label: "End-stage organ failure" },
  { id: "a3", domain: "A", label: "Severe neurological injury" },
  { id: "a4", domain: "A", label: "Multi-organ failure involving >3 organs" },
  { id: "a5", domain: "A", label: "Clinical Frailty Score > 6" },

  { id: "b1", domain: "B", label: "ICU stay > 7 days" },
  { id: "b2", domain: "B", label: "Mechanical ventilation > 5 days" },
  { id: "b3", domain: "B", label: ">2 ICU admissions in the last 3 months" },
  { id: "b4", domain: "B", label: "No meaningful improvement after 72–96 hours of full support" },
  { id: "b5", domain: "B", label: "Escalating organ support with poor trajectory" },

  { id: "c1", domain: "C", label: "Difficult-to-control pain" },
  { id: "c2", domain: "C", label: "Severe dyspnoea / air hunger" },
  { id: "c3", domain: "C", label: "Persistent agitation or distress" },
  { id: "c4", domain: "C", label: "Psychological distress in patient or family" },

  { id: "d1", domain: "D", label: "Goals of care unclear" },
  { id: "d2", domain: "D", label: "Family distress or conflict" },
  { id: "d3", domain: "D", label: "Disagreement between team and family" },
  { id: "d4", domain: "D", label: "Unrealistic expectations" },
  { id: "d5", domain: "D", label: "Cultural or religious complexity" },
  { id: "d6", domain: "D", label: "Staff moral distress / ethical concern" },

  { id: "e1", domain: "E", label: "Would you be surprised if this patient died during this admission?" }
];

const redChecklistOptions: RedChecklistOption[] = [
  { id: "r1", label: "Refractory suffering despite ICU treatment" },
  { id: "r2", label: "Persistent high-conflict decision situation" },
  { id: "r3", label: "Prolonged non-beneficial ICU course" },
  { id: "r4", label: "Catastrophic neurological injury with complex family dynamics" },
  { id: "r5", label: "Multi-domain complexity" },
  { id: "r6", label: "Staff moral distress due to ethically troubling treatment" }
];

function classify(selected: string[], red: string[]): TriageResult {

  if (red.length > 0) {
    return {
      category: "RED",
      summary: "RED trigger present. Refer Specialist Palliative Care.",
      triggeredDomains: [],
      triggerLabels: [],
      redReasons: red,
      actions: ["Refer Specialist Palliative Care Team"]
    };
  }

  if (selected.length === 0) {
    return {
      category: "GREEN",
      summary: "No trigger identified. Continue standard ICU care.",
      triggeredDomains: [],
      triggerLabels: [],
      redReasons: [],
      actions: ["Continue ICU care"]
    };
  }

  return {
    category: "AMBER-AMBER",
    summary: "Trigger present. ICU-led supportive care review recommended.",
    triggeredDomains: [],
    triggerLabels: [],
    redReasons: [],
    actions: ["Hold family meeting", "Discuss goals of care"]
  };
}

export default function Page() {

  const [selected, setSelected] = useState<string[]>([]);
  const [redSelected, setRedSelected] = useState<string[]>([]);

  const result = useMemo(() => classify(selected, redSelected), [selected, redSelected]);

  function toggle(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function toggleRed(id: string) {
    setRedSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  return (
    <main style={{ maxWidth: 800, margin: "auto", padding: 20 }}>

      <h1>ALIGN ICU Triage Tool</h1>

      <h2>Triggers</h2>

      {triggerOptions.map(t => (
        <label key={t.id} style={{ display: "block", marginBottom: 10 }}>
          <input
            type="checkbox"
            checked={selected.includes(t.id)}
            onChange={() => toggle(t.id)}
          /> {t.label}
        </label>
      ))}

      <h2>RED Checklist</h2>

      {redChecklistOptions.map(r => (
        <label key={r.id} style={{ display: "block", marginBottom: 10 }}>
          <input
            type="checkbox"
            checked={redSelected.includes(r.id)}
            onChange={() => toggleRed(r.id)}
          /> {r.label}
        </label>
      ))}

      <h2>Classification</h2>

      <div
        style={{
          padding: 20,
          borderRadius: 10,
          background: "#f1f5f9",
          marginBottom: 120
        }}
      >
        <strong>{result.category}</strong>
        <p>{result.summary}</p>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 15,
          left: 15,
          right: 15,
          background: "white",
          border: "1px solid #ccc",
          borderRadius: 12,
          padding: 12,
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
        }}
      >
        <strong>{result.category}</strong>
        <div>{result.summary}</div>
      </div>

    </main>
  );
}