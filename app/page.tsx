"use client";

import React, { useEffect, useMemo, useState } from "react";

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
  reassessment?: string;
};

const triggerOptions: TriggerOption[] = [
  { id: "a1", domain: "A", label: "Advanced or metastatic cancer" },
  {
    id: "a2",
    domain: "A",
    label: "End-stage organ failure",
    hint: "Examples: NYHA IV, ESLD MELD >20, ESRD not for long-term RRT, severe COPD with repeated ICU admissions",
  },
  {
    id: "a3",
    domain: "A",
    label: "Severe neurological injury",
    hint: "Examples: anoxic brain injury, high cervical SCI, massive stroke with poor prognosis",
  },
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
  { id: "c4", domain: "C", label: "Psychological or existential distress in patient or family" },

  { id: "d1", domain: "D", label: "Goals of care unclear" },
  { id: "d2", domain: "D", label: "Family distress or conflict" },
  { id: "d3", domain: "D", label: "Disagreement between team and family" },
  { id: "d4", domain: "D", label: "Unrealistic expectations" },
  { id: "d5", domain: "D", label: "Cultural or religious complexity" },
  { id: "d6", domain: "D", label: "Staff moral distress / ethical concern" },

  {
    id: "e1",
    domain: "E",
    label: "Would you be surprised if this patient died during this admission? → No",
  },
];

const redChecklistOptions: RedChecklistOption[] = [
  {
    id: "r1",
    label: "Refractory suffering despite ICU treatment",
    hint: "Pain, dyspnoea, or agitation not adequately controlled",
  },
  {
    id: "r2",
    label: "Persistent high-conflict decision situation",
    hint: "Family disagreement, conflict with team, denial of prognosis, demands for clearly non-beneficial treatment",
  },
  {
    id: "r3",
    label: "Prolonged non-beneficial ICU course",
    hint: "ICU stay >14 days with no recovery trajectory, or escalating organ support with no realistic recovery",
  },
  {
    id: "r4",
    label: "Catastrophic neurological injury with complex family dynamics",
  },
  {
    id: "r5",
    label: "Multi-domain complexity",
    hint: "Examples: long ICU stay + symptom burden + family conflict",
  },
  {
    id: "r6",
    label: "Staff moral distress due to disproportionate or ethically troubling treatment",
  },
];

const greenActions = [
  "Continue standard ICU care",
  "No current palliative trigger identified",
  "Repeat screening on ICU Day 3 and weekly thereafter",
];

const amberGreenActions = [
  "ICU-led supportive care review",
  "Monitor trajectory closely",
  "Consider consultant-led family meeting if concerns evolve",
  "Repeat assessment and review progression",
];

const amberAmberActions = [
  "Consultant-led family meeting within 48–72 hours",
  "Explain current illness, trajectory, and uncertainty clearly",
  "Discuss prognosis using best case, worst case, and most likely scenario",
  "Explore patient values, priorities, and acceptable outcomes",
  "Agree goals of care and document plan clearly",
  "Optimise symptom control",
  "Set reassessment point, usually within 72 hours",
];

const amberRedActions = [
  "Early escalation planning is recommended",
  "Consultant-led family meeting within 48–72 hours",
  "Discuss prognosis and uncertainty explicitly",
  "Clarify ceiling of care and likely trajectory",
  "Consider early Specialist Palliative Care involvement if concerns deepen",
  "Reassess within 72 hours",
];

const redActions = [
  "Refer to Specialist Palliative Care Team",
  "Continue ICU symptom relief and supportive care",
  "Hold urgent consultant-level multidisciplinary discussion",
  "Clarify goals of care and treatment boundaries",
  "Document decisions and communication clearly",
];

function classifyTriage(
  selectedTriggerIds: string[],
  selectedRedIds: string[],
): TriageResult {
  const selectedTriggers = triggerOptions.filter((t) => selectedTriggerIds.includes(t.id));
  const selectedReds = redChecklistOptions.filter((r) => selectedRedIds.includes(r.id));

  const triggeredDomains = Array.from(new Set(selectedTriggers.map((t) => t.domain))).sort() as Domain[];
  const triggerLabels = selectedTriggers.map((t) => t.label);
  const redReasons = selectedReds.map((r) => r.label);

  const noTriggers = selectedTriggers.length === 0;
  const hasDomainA = triggeredDomains.includes("A");
  const hasDomainB = triggeredDomains.includes("B");
  const hasDomainC = triggeredDomains.includes("C");
  const hasDomainD = triggeredDomains.includes("D");
  const hasDomainE = triggeredDomains.includes("E");
  const onlyDomainB = triggeredDomains.length === 1 && hasDomainB;
  const hasAnyRedChecklist = selectedReds.length > 0;

  const allowedAmberGreenBIds = ["b1", "b2"];
  const selectedBTriggerIds = selectedTriggers
    .filter((t) => t.domain === "B")
    .map((t) => t.id);

  const onlyAllowedAmberGreenBTriggers =
    selectedBTriggerIds.length > 0 &&
    selectedBTriggerIds.every((id) => allowedAmberGreenBIds.includes(id));

  if (hasAnyRedChecklist) {
    return {
      category: "RED",
      summary:
        "At least one RED checklist criterion is present. Refer Specialist Palliative Care.",
      triggeredDomains,
      triggerLabels,
      redReasons,
      actions: redActions,
    };
  }

  if (noTriggers) {
    return {
      category: "GREEN",
      summary:
        "No trigger was identified across Domains A to E. Continue standard ICU care and repeat screening later.",
      triggeredDomains,
      triggerLabels,
      redReasons,
      actions: greenActions,
    };
  }

  if (hasDomainA || hasDomainE) {
    return {
      category: "AMBER-RED",
      summary:
        "At least one trigger is present in Domain A and/or E.",
      triggeredDomains,
      triggerLabels,
      redReasons,
      actions: amberRedActions,
      reassessment:
        "Reassess within 72 hours. If worsening, persistent conflict, or refractory symptoms develop, reclassify as RED.",
    };
  }

  if (onlyDomainB && onlyAllowedAmberGreenBTriggers) {
    return {
      category: "AMBER-GREEN",
      summary:
        "No trigger in Domain A. Only Domain B trigger(s) present, limited to ICU stay >7 days and/or mechanical ventilation >5 days.",
      triggeredDomains,
      triggerLabels,
      redReasons,
      actions: amberGreenActions,
      reassessment:
        "Monitor progression and rescreen. Escalate if additional triggers or conflict emerge.",
    };
  }

  return {
    category: "AMBER-AMBER",
    summary:
      "No trigger in Domain A. Additional triggers are present in Domain B, C, and/or D beyond the AMBER-GREEN criteria.",
    triggeredDomains,
    triggerLabels,
    redReasons,
    actions: amberAmberActions,
    reassessment:
      "Reassess within 72 hours. If worsening, persistent conflict, or refractory symptoms develop, reclassify as RED.",
  };
}

function groupByDomain(options: TriggerOption[]) {
  return {
    A: options.filter((o) => o.domain === "A"),
    B: options.filter((o) => o.domain === "B"),
    C: options.filter((o) => o.domain === "C"),
    D: options.filter((o) => o.domain === "D"),
    E: options.filter((o) => o.domain === "E"),
  };
}

function badgeStyle(category: FinalCategory): React.CSSProperties {
  if (category === "GREEN") {
    return { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" };
  }
  if (category === "RED") {
    return { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" };
  }
  if (category === "AMBER-RED") {
    return { background: "#fcd34d", color: "#78350f", border: "1px solid #f59e0b" };
  }
  if (category === "AMBER-AMBER") {
    return { background: "#fde68a", color: "#854d0e", border: "1px solid #fbbf24" };
  }
  return { background: "#ecfccb", color: "#3f6212", border: "1px solid #bef264" };
}

function panelStyle(category: FinalCategory): React.CSSProperties {
  if (category === "GREEN") {
    return { background: "#f0fdf4", border: "1px solid #86efac" };
  }
  if (category === "RED") {
    return { background: "#fef2f2", border: "1px solid #fca5a5" };
  }
  if (category === "AMBER-RED") {
    return { background: "#fffbeb", border: "2px solid #f59e0b" };
  }
  if (category === "AMBER-AMBER") {
    return { background: "#fffbeb", border: "1px solid #fbbf24" };
  }
  return { background: "#f7fee7", border: "1px solid #bef264" };
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "24px",
    paddingBottom: "280px",
  },
  wrap: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  hero: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    marginBottom: "24px",
  },
  section: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    marginBottom: "24px",
  },
  sectionHeader: {
    marginTop: 0,
    marginBottom: "6px",
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
  },
  sectionSubtext: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.5,
    fontSize: "14px",
  },
  option: {
    display: "flex",
    gap: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "12px",
    marginTop: "12px",
    alignItems: "flex-start",
    background: "#ffffff",
  },
  badge: {
    borderRadius: "999px",
    padding: "14px 22px",
    fontWeight: 700,
    fontSize: "18px",
    display: "inline-block",
  },
  statusPanel: {
    borderRadius: "20px",
    padding: "18px",
    marginTop: "18px",
  },
  statusTitle: {
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#475569",
    marginBottom: "8px",
  },
  statusSummary: {
    marginTop: "14px",
    fontSize: "17px",
    lineHeight: 1.55,
    color: "#1e293b",
    fontWeight: 600,
  },
  infoItem: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "8px 10px",
    marginTop: "8px",
    background: "#ffffff",
  },
  actionItem: {
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "12px 14px",
    marginTop: "10px",
    background: "#f8fafc",
  },
  workflowItem: {
    borderRadius: "18px",
    padding: "14px 16px",
    marginTop: "12px",
    fontSize: "16px",
    lineHeight: 1.55,
    fontWeight: 600,
  },
  button: {
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    padding: "10px 16px",
    cursor: "pointer",
  },
  note: {
    marginTop: "16px",
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    borderRadius: "16px",
    padding: "14px",
    color: "#1e3a8a",
  },
  stickyBarDesktop: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "36px",
    width: "min(860px, calc(100vw - 32px))",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "24px",
    padding: "18px 20px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
    zIndex: 1000,
  },
  stickyBarMobile: {
    position: "fixed",
    left: "16px",
    right: "16px",
    bottom: "42vh",
    background: "#ffffff",
    border: "2px solid #cbd5e1",
    borderRadius: "24px",
    padding: "20px 20px",
    boxShadow: "0 14px 36px rgba(0,0,0,0.22)",
    zIndex: 1000,
  },
  stickyHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },
  stickyTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
  },
  stickyText: {
    marginTop: "12px",
    fontSize: "20px",
    color: "#334155",
    lineHeight: 1.55,
    fontWeight: 600,
  },
};

export default function Page() {
  const [selectedTriggerIds, setSelectedTriggerIds] = useState<string[]>([]);
  const [selectedRedIds, setSelectedRedIds] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const grouped = groupByDomain(triggerOptions);

  const result = useMemo(
    () => classifyTriage(selectedTriggerIds, selectedRedIds),
    [selectedTriggerIds, selectedRedIds],
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function toggleTrigger(id: string) {
    setSelectedTriggerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleRed(id: string) {
    setSelectedRedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function resetAll() {
    setSelectedTriggerIds([]);
    setSelectedRedIds([]);
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.hero}>
          <h1 style={{ margin: 0, fontSize: "34px", fontWeight: 800 }}>ALIGN ICU Triage Tool</h1>
          <p style={{ marginTop: "10px", lineHeight: 1.6, color: "#475569" }}>
            Prototype bedside screening tool based on your ALIGN workflow. Screen on ICU Day 3
            and weekly thereafter. Validate against local governance before clinical deployment.
          </p>
        </div>

        <DomainCard
          title="Domain A · Disease / Prognosis"
          subtitle="Triggers related to underlying prognosis, frailty, and major disease burden."
          items={grouped.A}
          selectedIds={selectedTriggerIds}
          onToggle={toggleTrigger}
        />

        <DomainCard
          title="Domain B · ICU Course"
          subtitle="Triggers related to length of stay, repeated ICU use, and clinical trajectory."
          items={grouped.B}
          selectedIds={selectedTriggerIds}
          onToggle={toggleTrigger}
        />

        <DomainCard
          title="Domain C · Symptom Burden"
          subtitle="Triggers related to distressing symptoms and difficult symptom control."
          items={grouped.C}
          selectedIds={selectedTriggerIds}
          onToggle={toggleTrigger}
        />

        <DomainCard
          title="Domain D · Communication / Decision"
          subtitle="Triggers related to family distress, unclear goals, or complex decision-making."
          items={grouped.D}
          selectedIds={selectedTriggerIds}
          onToggle={toggleTrigger}
        />

        <DomainCard
          title="Domain E · Surprise Question"
          subtitle="Trigger based on clinician concern about in-hospital mortality."
          items={grouped.E}
          selectedIds={selectedTriggerIds}
          onToggle={toggleTrigger}
        />

        <section style={styles.section}>
          <h2 style={styles.sectionHeader}>RED Checklist</h2>
          <p style={styles.sectionSubtext}>
            If any RED criterion is present, classify as RED and recommend specialist palliative care referral.
          </p>

          {redChecklistOptions.map((item) => (
            <label key={item.id} style={styles.option}>
              <input
                type="checkbox"
                checked={selectedRedIds.includes(item.id)}
                onChange={() => toggleRed(item.id)}
                style={{ marginTop: "4px" }}
              />
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.label}</div>
                {item.hint ? (
                  <div style={{ marginTop: "6px", fontSize: "14px", color: "#64748b" }}>{item.hint}</div>
                ) : null}
              </div>
            </label>
          ))}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionHeader}>Classification</h2>
          <p style={styles.sectionSubtext}>
            This section updates automatically based on the currently selected triggers.
          </p>

          <div style={{ ...styles.statusPanel, ...panelStyle(result.category) }}>
            <div style={styles.statusTitle}>Current result</div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>{result.category}</div>
              <span style={{ ...styles.badge, ...badgeStyle(result.category) }}>{result.category}</span>
            </div>

            <div style={styles.statusSummary}>{result.summary}</div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <InfoBlock title="Triggered domains" emptyText="None" items={result.triggeredDomains} />
            <div style={{ height: "16px" }} />
            <InfoBlock title="Selected triggers" emptyText="No trigger selected" items={result.triggerLabels} />
          </div>

          {result.redReasons.length > 0 ? (
            <div style={{ marginTop: "20px" }}>
              <InfoBlock title="RED reasons" emptyText="None" items={result.redReasons} />
            </div>
          ) : null}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionHeader}>Recommended actions</h2>
          <p style={styles.sectionSubtext}>
            These action prompts are tied to the current classification and should support, not replace, clinical judgement.
          </p>

          {result.actions.map((action) => (
            <div key={action} style={styles.actionItem}>{action}</div>
          ))}

          {result.reassessment ? (
            <div style={styles.note}>
              <strong>Reassessment:</strong> {result.reassessment}
            </div>
          ) : null}
        </section>

        <section style={{ ...styles.section, ...panelStyle(result.category) }}>
          <h2 style={styles.sectionHeader}>Workflow reminder</h2>
          <p style={styles.sectionSubtext}>
            Quick reminder for bedside use. This section changes colour to match the current triage category.
          </p>

          <div style={{ ...styles.workflowItem, background: "#ffffff", border: "1px solid #cbd5e1" }}>
            1. Screen on ICU Day 3 and weekly thereafter. Re-screen earlier if the patient's condition changes.
          </div>

          <div style={{ ...styles.workflowItem, background: "#ffffff", border: "1px solid #cbd5e1" }}>
            2. Consult ICU consultant on ICU-led supportive care plans — especially for AMBER-AMBER and AMBER-RED classifications.
          </div>
        </section>

        <button onClick={resetAll} style={styles.button}>Reset all</button>
      </div>

      <div style={isMobile ? styles.stickyBarMobile : styles.stickyBarDesktop}>
        <div style={styles.stickyHeading}>
          <strong style={styles.stickyTitle}>Current classification</strong>
          <span style={{ ...styles.badge, ...badgeStyle(result.category) }}>{result.category}</span>
        </div>
        <div style={styles.stickyText}>{result.summary}</div>
      </div>
    </main>
  );
}

function DomainCard({
  title,
  subtitle,
  items,
  selectedIds,
  onToggle,
}: {
  title: string;
  subtitle: string;
  items: TriggerOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionHeader}>{title}</h2>
      <p style={styles.sectionSubtext}>{subtitle}</p>

      {items.map((item) => (
        <label key={item.id} style={styles.option}>
          <input
            type="checkbox"
            checked={selectedIds.includes(item.id)}
            onChange={() => onToggle(item.id)}
            style={{ marginTop: "4px" }}
          />
          <div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.label}</div>
            {item.hint ? (
              <div style={{ marginTop: "6px", fontSize: "14px", color: "#64748b" }}>{item.hint}</div>
            ) : null}
          </div>
        </label>
      ))}
    </section>
  );
}

function InfoBlock({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div>
      <h3 style={{ margin: 0, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>
        {title}
      </h3>
      {items.length === 0 ? (
        <p style={{ marginTop: "10px", color: "#64748b" }}>{emptyText}</p>
      ) : (
        <div style={{ marginTop: "8px" }}>
          {items.map((item) => (
            <div key={item} style={styles.infoItem}>{item}</div>
          ))}
        </div>
      )}
    </div>
  );
}