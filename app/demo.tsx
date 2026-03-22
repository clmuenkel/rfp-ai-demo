/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useEffect } from "react";

const theme = {
  blue: "#0071e3",
  blueHover: "#0077ED",
  blueLight: "#E8F0FE",
  blueMuted: "#d1e3fa",
  bgPage: "#f5f5f7",
  bgCard: "#ffffff",
  textPrimary: "#1d1d1f",
  textSecondary: "#86868b",
  textTertiary: "#aeaeb2",
  border: "#d2d2d7",
  borderLight: "#e8e8ed",
  divider: "#f0f0f5",
  statusGreenBg: "#e8f5e9",
  statusGreenBorder: "#c8e6c9",
  statusGreenText: "#1b5e20",
  statusYellowBg: "#fff8e1",
  statusYellowBorder: "#fff0b3",
  statusYellowText: "#7a6200",
  statusRedBg: "#fce4ec",
  statusRedBorder: "#f8bbd0",
  statusRedText: "#b71c1c",
  shadowSm: "0 1px 3px rgba(0,0,0,0.08)",
  shadowMd: "0 2px 8px rgba(0,0,0,0.08)",
  shadowInput: "0 1px 4px rgba(0,0,0,0.06)",
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusPill: 980,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'SF Mono', monospace",
  transition: "0.3s ease",
  transitionFast: "0.15s ease",
};

function RenderMD({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements: any[] = [];
  let tableRows: string[] = [];
  let inTable = false;
  let key = 0;

  function flushTable() {
    if (tableRows.length === 0) return;
    const headerCells = tableRows[0].split("|").filter(c => c.trim());
    const dataRows = tableRows.slice(2); // skip header + separator
    elements.push(
      <div key={key++} style={{ overflowX: "auto", margin: "12px 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: theme.divider }}>
              {headerCells.map((c, i) => (
                <th key={i} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, borderBottom: `2px solid ${theme.border}`, color: theme.textPrimary, fontSize: 12, whiteSpace: "nowrap" }}>{c.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => {
              const cells = row.split("|").filter(c => c.trim());
              return (
                <tr key={ri} style={{ background: ri % 2 === 1 ? "#fafafa" : "#fff" }}>
                  {cells.map((c, ci) => {
                    const val = c.trim();
                    const isNum = /^\$|^\d/.test(val) || /^\*\*\$/.test(val);
                    const isBold = val.startsWith("**") && val.endsWith("**");
                    const display = isBold ? val.slice(2, -2) : val;
                    return (
                      <td key={ci} style={{ padding: "7px 12px", borderBottom: `1px solid ${theme.divider}`, color: theme.textPrimary, textAlign: isNum && ci > 0 ? "right" : "left", fontWeight: isBold ? 700 : 400, fontFamily: isNum ? theme.fontMono : "inherit", fontSize: isNum ? 12.5 : 13 }}>{display}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table detection
    if (trimmed.startsWith("|")) {
      if (!inTable) inTable = true;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Horizontal rule
    if (trimmed === "---" || trimmed === "***") {
      elements.push(<hr key={key++} style={{ border: "none", borderTop: `1px solid ${theme.divider}`, margin: "20px 0" }} />);
      continue;
    }

    // Headers
    if (trimmed.startsWith("# ")) {
      elements.push(<h1 key={key++} style={{ fontSize: 22, fontWeight: 700, margin: "28px 0 8px", color: theme.textPrimary, letterSpacing: "-0.03em" }}>{trimmed.slice(2)}</h1>);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      const num = trimmed.match(/^## (\d+)\./);
      elements.push(
        <h2 key={key++} style={{ fontSize: 16, fontWeight: 700, margin: "24px 0 8px", color: theme.textPrimary, padding: "10px 0 6px", borderBottom: `2px solid ${theme.blue}`, display: "flex", alignItems: "center", gap: 8 }}>
          {num && <span style={{ background: theme.blue, color: "#fff", width: 24, height: 24, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{num[1]}</span>}
          {num ? trimmed.slice(trimmed.indexOf(".") + 2) : trimmed.slice(3)}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={key++} style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 6px", color: theme.textSecondary }}>{trimmed.slice(4)}</h3>);
      continue;
    }

    // Empty line
    if (trimmed === "") {
      elements.push(<div key={key++} style={{ height: 6 }} />);
      continue;
    }

    // Bold-only lines
    if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.includes("**", 2)) {
      elements.push(<p key={key++} style={{ fontSize: 13.5, fontWeight: 700, margin: "12px 0 4px", color: theme.textPrimary, lineHeight: 1.5 }}>{trimmed.slice(2, -2)}</p>);
      continue;
    }

    // Regular paragraph with inline formatting
    const formatted = trimmed
      .replace(/\*\*(.+?)\*\*/g, "⟪B⟫$1⟪/B⟫")
      .split(/(⟪\/?B⟫)/g);

    const spans = [];
    let bold = false;
    for (const part of formatted) {
      if (part === "⟪B⟫") { bold = true; continue; }
      if (part === "⟪/B⟫") { bold = false; continue; }
      if (part) spans.push(<span key={spans.length} style={bold ? { fontWeight: 600, color: theme.textPrimary } : {}}>{part}</span>);
    }

    elements.push(<p key={key++} style={{ fontSize: 13.5, lineHeight: 1.7, margin: "3px 0", color: theme.textPrimary }}>{spans}</p>);
  }

  if (inTable) flushTable();
  return <>{elements}</>;
}

function RenderAnalysis({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements: any[] = [];
  let key = 0;

  for (const line of lines) {
    const t = line.trim();
    if (!t) { elements.push(<div key={key++} style={{ height: 6 }} />); continue; }

    if (t.startsWith("✅ You should") || t.startsWith("❌ Skip") || t.startsWith("⚠️ This is")) {
      const color = t.startsWith("✅") ? theme.statusGreenText : t.startsWith("❌") ? theme.statusRedText : theme.statusYellowText;
      const bg = t.startsWith("✅") ? theme.statusGreenBg : t.startsWith("❌") ? theme.statusRedBg : theme.statusYellowBg;
      const border = t.startsWith("✅") ? theme.statusGreenBorder : t.startsWith("❌") ? theme.statusRedBorder : theme.statusYellowBorder;
      elements.push(<div key={key++} style={{ background: bg, color, border: `1px solid ${border}`, padding: "14px 20px", borderRadius: theme.radiusMd, fontSize: 16, fontWeight: 600, margin: "0 0 20px" }}>{t}</div>);
      continue;
    }

    if (t === "REQUIREMENTS MATCH" || t === "SCORECARD" || t === "TOP 3 RISKS" || t.startsWith("ESTIMATED PRICE") || t === "REFINE YOUR BID" || t === "ASK ABOUT THIS RFP") {
      elements.push(<p key={key++} style={{ fontSize: 11, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em", margin: "24px 0 10px", borderBottom: `1px solid ${theme.divider}`, paddingBottom: 8 }}>{t}</p>);
      continue;
    }

    if (t.startsWith("✅") || t.startsWith("⚠️") || t.startsWith("❌")) {
      const icon = t.slice(0, 2);
      const rest = t.slice(2).trim().replace(/—/, "").trim();
      const [label, ...desc] = rest.split("—").length > 1 ? rest.split("—") : rest.split(" — ");
      const bg = icon === "✅" ? theme.statusGreenBg : icon === "⚠️" ? theme.statusYellowBg : theme.statusRedBg;
      const border = icon === "✅" ? theme.statusGreenBorder : icon === "⚠️" ? theme.statusYellowBorder : theme.statusRedBorder;
      elements.push(
        <div key={key++} style={{ display: "flex", gap: 10, padding: "10px 14px", background: bg, border: `1px solid ${border}`, borderRadius: 10, margin: "5px 0", fontSize: 13, lineHeight: 1.6 }}>
          <span style={{ flexShrink: 0 }}>{icon}</span>
          <span>{desc.length ? <><strong>{label.trim()}</strong> — {desc.join("—").trim()}</> : rest}</span>
        </div>
      );
      continue;
    }

    if (/^\d+\.\s/.test(t)) {
      const num = t.match(/^(\d+)\./)![1];
      const rest = t.slice(t.indexOf(".") + 1).trim();
      const [label, score, ...desc] = rest.split("—").map(s => s.trim());
      if (score && /\d\/5/.test(score)) {
        const n = parseInt(score);
        elements.push(
          <div key={key++} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 13 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: theme.divider, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: theme.textSecondary, flexShrink: 0 }}>{num}</span>
            <span style={{ flex: 1 }}><strong>{label}</strong></span>
            <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
              {[1,2,3,4,5].map(j => <div key={j} style={{ width: 8, height: 8, borderRadius: "50%", background: j <= n ? theme.blue : theme.borderLight }} />)}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: theme.blue, minWidth: 28, textAlign: "right" }}>{score}</span>
          </div>
        );
        if (desc.length) elements.push(<p key={key++} style={{ fontSize: 12, color: theme.textSecondary, margin: "0 0 4px", paddingLeft: 32 }}>{desc.join("—")}</p>);
        continue;
      }
    }

    if (t.startsWith("Total:")) {
      elements.push(<div key={key++} style={{ background: theme.textPrimary, color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 15, fontWeight: 700, margin: "10px 0", display: "flex", justifyContent: "space-between" }}>
        <span>{t.split("—")[0].trim()}</span>
        <span style={{ color: "#ffd60a" }}>{t.split("—")[1]?.trim() || ""}</span>
      </div>);
      continue;
    }

    elements.push(<p key={key++} style={{ fontSize: 13.5, lineHeight: 1.6, margin: "3px 0", color: theme.textPrimary }}>{t}</p>);
  }
  return <>{elements}</>;
}

const PREBAKED_ANALYSIS = `✅ You should bid on this.

This is right in your wheelhouse — hospital plumbing and medical gas, the exact scope you crushed at Methodist Dallas.

REQUIREMENTS MATCH

✅ Hospital medical gas (5+ projects) — You have 6 including Methodist Dallas, Baylor S&W McKinney, and Children's Health Plano clinic.
✅ NFPA 99 certified brazers (min 4) — You have 6: Whitfield, Vasquez, Torres, Sanchez, Park, Ramirez.
✅ ASME Section IX welders — You have 4 qualified welders on staff.
✅ EMR below 1.0 — Yours is 0.78 with zero lost-time incidents in 2024 and 2025.
✅ BIM Level 2 / LOD 350 — David Okonkwo delivers LOD 350 as standard. Done on Methodist Dallas.
✅ Bonding capacity — Project est. $1.5–2.2M, well within your $8M single limit.
✅ Insurance — Your $2M GL + $5M umbrella meets all requirements.
✅ Prevailing wage — Davis-Bacon is standard for you. Certified payroll set up.
✅ Background checks — CJIS-level done for Methodist Dallas. Same process.
⚠️ DPR Construction — New GC for you. Strong firm but no existing relationship yet.
⚠️ Pediatric surgical — You did Children's Health clinic ($380K) but not a surgical suite. Methodist Dallas ORs are closest comp.
✅ 12-month schedule — Methodist Dallas was 14 months for a bigger scope. Very doable.

SCORECARD

1. Right size? — 5/5 — Est. $1.5–2.2M, dead center of sweet spot
2. Scope match? — 5/5 — Plumbing + med gas is your #1 specialty
3. Crew available? — 5/5 — Roberto, James, Daniel, Miguel all free April 15
4. GC relationship? — 3/5 — DPR is new but you have strong comparable refs
5. Sector experience? — 4/5 — Strong hospital history, slight pediatric gap
6. Schedule risk? — 4/5 — 12 months realistic based on Methodist timeline
7. Competition? — 4/5 — Mid-size med gas shops are rare at this level
8. Bonding? — 5/5 — Well within capacity
9. Geography? — 5/5 — Plano TX, 25 min from your office
10. Strategic value? — 5/5 — Children's Health is a marquee client

Total: 45/50 — STRONG BID

TOP 3 RISKS
1. New GC relationship with DPR — mitigate with strong Robins & Morton and Skanska references.
2. Pediatric surgical is a step up from your clinic work — ICRA Class IV and pediatric-specific outlets add complexity.
3. Third-party verification with Smith Medical Gas — you've done this (Methodist Dallas) but it adds schedule pressure.

ESTIMATED PRICE RANGE: $1,650,000 – $2,100,000
Based on Methodist Dallas ($2.4M / 180,000 SF) scaled to 22,000 SF with comparable med gas density.`;

const PREBAKED_BID = `# Ironflow Mechanical, Inc. — Bid Response
## Children's Health Plano — Surgical Suite Expansion (CHP-2026-SS-MEP)
## Submitted: April 24, 2026

---

## 1. Executive Summary

Ironflow Mechanical is pleased to submit this proposal for the plumbing and medical gas systems at the Children's Health Plano Surgical Suite Expansion. With six certified medical gas installers on staff and four completed hospital medical gas projects in the past three years — including the **$2.4M Methodist Dallas Patient Tower** with four operating suites — we bring proven healthcare capability to this pediatric-critical project.

Our team is uniquely positioned for this work. **Superintendent Roberto Vasquez** and **Medical Gas Lead James Whitfield**, who together delivered the Methodist Dallas project two weeks ahead of schedule, are both available for mobilization in mid-April. Our in-house BIM team, led by **David Okonkwo**, will deliver a LOD 350 Revit model and participate in weekly coordination with DPR — the same approach that identified **47 MEP clashes** at UT Southwestern before a single pipe was installed.

We understand the critical nature of pediatric surgical environments. Our proposal reflects ICRA Class IV compliance, NFPA 99 Category 1 medical gas installation, and the specialized care required when working adjacent to occupied patient areas.

---

## 2. Bid Pricing

### Base Bid

| Line Item | Amount |
|---|---|
| Base Bid — Plumbing | $1,185,000 |
| Base Bid — Medical Gas | $695,000 |
| **Total Base Bid** | **$1,880,000** |

### Alternates and Unit Prices

| Item | Amount |
|---|---|
| Alt #1 — RFID-tagged medical gas outlets | $42,000 |
| Alt #2 — Antimicrobial copper piping (patient areas) | $68,000 |
| Unit Price A — Additional med gas outlet (each) | $2,400 |
| Unit Price B — Additional OR scrub sink (each) | $8,800 |
| Unit Price C — Additional headwall rough-in (each) | $6,200 |

### Labor Breakdown

| Classification | Hours | Rate (Prevailing) | Extended |
|---|---|---|---|
| Superintendent | 1,800 | $78.50/hr | $141,300 |
| Foreman — Plumbing | 2,200 | $74.20/hr | $163,240 |
| Foreman — Medical Gas | 1,400 | $78.50/hr | $109,900 |
| Journeyman Plumber | 4,800 | $62.40/hr | $299,520 |
| Medical Gas Brazer | 2,800 | $70.80/hr | $198,240 |
| Apprentice (4th year) | 2,400 | $45.60/hr | $109,440 |
| BIM Technician | 480 | $55.00/hr | $26,400 |
| **Total Labor** | **15,880** | | **$1,048,040** |

### Material Breakdown

| Category | Amount |
|---|---|
| Copper pipe and fittings (Type L) | $142,000 |
| Cast iron pipe (no-hub) | $68,000 |
| Polypropylene acid waste piping | $24,000 |
| Plumbing fixtures | $118,000 |
| Medical gas pipe (Type K copper) | $86,000 |
| Zone valve boxes, outlets, alarms | $112,000 |
| Thermostatic mixing valves (ASSE 1070) | $18,000 |
| Floor drains, trap primers, cleanouts | $22,000 |
| Backflow preventers | $16,000 |
| Hangers, supports, insulation, sealants | $48,000 |
| **Total Material** | **$654,000** |

### Overhead

| Item | Amount |
|---|---|
| Equipment and tools | $28,000 |
| Bond premium (3.5%) | $65,800 |
| Project insurance (2.5%) | $47,000 |
| Permit fees | $8,000 |
| Mobilization | $6,000 |
| ICRA compliance setup | $12,000 |
| OH&P | $11,160 |
| **Total Overhead** | **$177,960** |

---

## 3. Qualifications & Experience

**Methodist Dallas Medical Center — Patient Tower Expansion**
$2,378,000 | GC: Robins & Morton | 2024
180,000 SF, 6-story. Full plumbing + medical gas for 120 rooms and 4 OR suites. Completed 2 weeks ahead of schedule. Zero safety incidents. 68 BIM clashes resolved pre-construction.

**Baylor Scott & White McKinney Medical Center**
$1,180,000 | GC: Skanska | 2023
90,000 SF MOB. Plumbing, medical gas (200+ outlets), HVAC piping. Added to Skanska's DFW preferred list.

**Children's Health Plano — Outpatient Clinic**
$380,000 | GC: Rogers-O'Brien | 2024
Medical gas installation for outpatient procedure rooms. Direct experience with Children's Health standards.

**UT Southwestern — Research Lab Fit-Out**
$684,000 | GC: Linbeck Group | 2024
Acid waste, DI water, compressed air, lab gas. 12 MEP trades in 14" ceiling — 47 clashes caught in BIM.

**Frisco ISD — Lone Star High School**
$892,000 | GC: Pogue Construction | 2024
42 ADA fixture groups, 14 restrooms. Completed in 7 of 8 available weeks.

---

## 4. Medical Gas Qualifications

| Name | Certification | Cert Number | Experience |
|---|---|---|---|
| James Whitfield | NFPA 99 + ASME IX | MG-2019-441 | 12 years |
| Roberto Vasquez | NFPA 99 + ASME IX | MG-2020-512 | 14 years |
| Daniel Torres | NFPA 99 | MG-2021-603 | 10 years |
| Miguel Sanchez | NFPA 99 + ASME IX | MG-2021-618 | 9 years |
| Kevin Park | NFPA 99 | MG-2022-705 | 7 years |
| Luis Ramirez | NFPA 99 | MG-2023-801 | 6 years |

All brazing performed with nitrogen purge per NFPA 99. We have coordinated third-party verification with **Smith Medical Gas Verification** on Methodist Dallas and are familiar with their 48-hour standing time protocol.

---

## 5. Proposed Project Team

| Role | Name | Experience | Certifications |
|---|---|---|---|
| Project Manager | Carlos Espinoza | 18 years | JP, OSHA 30 |
| Superintendent | Roberto Vasquez | 14 years | JP, NFPA 99, ASME IX, OSHA 30 |
| Foreman — Med Gas | James Whitfield | 12 years | JP, NFPA 99, ASME IX, OSHA 30 |
| Foreman — Plumbing | Daniel Torres | 10 years | JP, NFPA 99, OSHA 30 |
| BIM Lead | David Okonkwo | 6 years | Revit MEP, Navisworks |
| Med Gas Brazers | Sanchez, Park | 9 / 7 years | NFPA 99, OSHA 10 |

---

## 6. Safety Record

| Metric | Ironflow | Industry Avg |
|---|---|---|
| EMR (current) | 0.74 | 1.00 |
| EMR (3-year avg) | 0.78 | 1.00 |
| Lost-time incidents (2024) | 0 | — |
| Lost-time incidents (2025) | 0 | — |
| OSHA TRIR | 1.46 | 3.40 |

All supers and foremen: OSHA 30. All field: OSHA 10 + CPR/First Aid. ISNetworld Grade A, Avetta compliant, PICS compliant. CJIS background checks available. Drug testing: pre-employment + random.

Hospital experience with ICRA Class III/IV on Methodist Dallas — negative pressure, HEPA filtration, daily barrier inspections.

---

## 7. BIM/VDC Approach

- **LOD 350 Revit model** delivered within 4 weeks of NTP
- **Weekly BIM coordination** with DPR's VDC team
- **Clash detection** — 90%+ clashes resolved before field work (47 found at UTSW, 68 at Methodist Dallas)
- **Prefabrication** — med gas risers and water rack assemblies built in our 4,000 SF Dallas shop, reducing field labor 15-20%

---

## 8. Schedule

| Phase | Months | Key Activities |
|---|---|---|
| Mobilization & Underground | 1–2 | BIM model, underground rough-in, ICRA setup |
| Med Gas Rough-In | 3–5 | OR and pre/post-op med gas piping, zone valves |
| Above-Grade Plumbing | 5–7 | Domestic water, sanitary waste, acid waste |
| Fixture & Trim | 7–9 | Scrub sinks, headwalls, restroom fixtures |
| Testing & Commissioning | 9–11 | 48-hr pressure tests, purity, cross-connection |
| Verification & Punch | 11–12 | Smith Medical Gas verification, punch, close-out |

Methodist Dallas (14 months planned) was completed in 13.5 months. We can accelerate by 2 weeks if needed.

---

## 9. References

| GC | Contact | Project |
|---|---|---|
| Robins & Morton | Austin Reed, Sr. PM — (615) 555-0188 | Methodist Dallas ($2.4M) |
| Skanska USA | Jennifer Walsh, PM — (214) 555-0233 | Baylor S&W McKinney ($1.2M) |
| Rogers-O'Brien | David Mullins, PM — (972) 555-0199 | Children's Health Plano ($380K) |`;

const COMPANY_CTX = `You are the AI for Ironflow Mechanical, a 38-person commercial plumbing contractor in Dallas, TX. Answer follow-ups using real company data. Be conversational and specific. Use real names and numbers.

Key data: $14.8M revenue, 6 NFPA 99 brazers, EMR 0.78, bonding $8M/$20M. Won: Methodist Dallas $2.4M, Legacy West $1.6M, BSW McKinney $1.2M, Frisco ISD $892K, UTSW Lab $684K, Amazon DFW3 $420K. Lost: Parkland $5.1M (too big), Amazon DFW2 $440K (OT pricing). Rates: journeyman $58/hr ($82 burdened), foreman $68/hr, brazer $65/hr. Margin avg 16.3%. Team: Roberto Vasquez (super), James Whitfield (med gas lead), Daniel Torres (foreman), Carlos Espinoza (VP ops), David Okonkwo (BIM), Rachel Kim (estimating).`;

const SAMPLE_RFP = `INVITATION TO BID: Plumbing & Medical Gas — Children's Health Plano Surgical Suite Expansion
GC: DPR Construction | Bid Date: April 25, 2026 | 22,000 SF, 4 pediatric ORs, 12 pre/post-op bays
Requirements: NFPA 99 Cat 1 med gas, 5+ hospital projects, 4+ certified brazers, EMR <1.0, BIM LOD 350, prevailing wage, 12-month schedule, $3,500/day LDs`;

export default function App() {
  const [step, setStep] = useState("upload");
  const [rfpText, setRfpText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [bidDoc, setBidDoc] = useState("");
  const [messages, setMessages] = useState<{role: string; text: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [typingFor, setTypingFor] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const bidRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  function typeOut(text: string, target: string) {
    setTyping(true);
    setTypingFor(target);
    setDisplayText("");
    let i = 0;
    const speed = target === "bid" ? 18 : 14;
    const id = setInterval(() => {
      i += speed;
      if (i >= text.length) {
        setDisplayText(text);
        setTyping(false);
        if (target === "analysis") setAnalysis(text);
        if (target === "bid") setBidDoc(text);
        clearInterval(id);
      } else {
        setDisplayText(text.slice(0, i));
      }
    }, 8);
  }

  function runDemo() {
    setRfpText(SAMPLE_RFP);
    setStep("analyzing");
    setTimeout(() => { setStep("results"); typeOut(PREBAKED_ANALYSIS, "analysis"); }, 1000);
  }

  function generateDemoBid() {
    typeOut(PREBAKED_BID, "bid");
  }

  function handleFile(e: any) {
    const f = e.target.files?.[0];
    if (f) { const r = new FileReader(); r.onload = ev => { setRfpText(ev.target?.result as string); setStep("results"); setAnalysis("Analyzing your RFP... (API call in production)"); }; r.readAsText(f); }
  }

  async function askFollowUp(text: string) {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);
    const history = messages.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2500, system: COMPANY_CTX + `\nRFP: ${rfpText}\n${bidDoc ? "Generated bid:\n" + bidDoc.slice(0, 2000) : ""}`, messages: [...history, { role: "user", content: text }] }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.content?.map((b: any) => b.text || "").join("") || "Error." }]);
    } catch { setMessages(prev => [...prev, { role: "ai", text: "Couldn't connect." }]); }
    setLoading(false);
  }

  function reset() { setStep("upload"); setRfpText(""); setAnalysis(""); setBidDoc(""); setMessages([]); setDisplayText(""); setTyping(false); }

  const showAnalysis = analysis || (typingFor === "analysis" ? displayText : "");
  const showBid = bidDoc || (typingFor === "bid" ? displayText : "");
  const suggestions = bidDoc
    ? ["Lower the base bid by 5%", "Strengthen the medical gas section", "Add more schedule detail", "Shorten the executive summary"]
    : ["Draft just the safety section", "What crew should we assign?", "How does pricing compare to Methodist Dallas?", "What are the biggest risks?"];

  return (
    <div style={{ fontFamily: theme.fontFamily, background: theme.bgPage, minHeight: "100vh", color: theme.textPrimary }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header — frosted glass */}
      <div style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={reset}>
          <span style={{ fontWeight: 700, fontSize: 17, color: theme.textPrimary, letterSpacing: "-0.02em" }}>Ironflow<span style={{ color: theme.blue }}> AI</span></span>
        </div>
        {step !== "upload" && <button onClick={reset} style={{ padding: "6px 14px", borderRadius: theme.radiusPill, border: `1px solid ${theme.border}`, background: theme.bgCard, color: theme.textSecondary, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: theme.transitionFast }}>New RFP</button>}
      </div>

      {/* Upload page */}
      {step === "upload" && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: theme.radiusXl, background: theme.blueLight, display: "flex", alignItems: "center", justifyContent: "center", color: theme.blue, fontWeight: 700, fontSize: 26, margin: "0 auto 24px" }}>IF</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.03em" }}>Upload an RFP</h1>
          <p style={{ fontSize: 17, color: theme.textSecondary, margin: "0 0 40px", lineHeight: 1.5 }}>We'll check if you can do the job, then<br/>draft your complete bid response.</p>
          <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${theme.border}`, borderRadius: theme.radiusXl, padding: "56px 40px", cursor: "pointer", transition: `all ${theme.transition}`, marginBottom: 20, background: theme.bgCard, boxShadow: theme.shadowSm }}
            onMouseOver={e => { e.currentTarget.style.borderColor = theme.blue; e.currentTarget.style.background = theme.blueLight; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgCard; }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
            <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 4px", color: theme.textPrimary }}>Drop your RFP here, or click to browse</p>
            <p style={{ fontSize: 12, color: theme.textTertiary, margin: 0 }}>Supports .txt, .md files</p>
            <input ref={fileRef} type="file" accept=".txt,.md" onChange={handleFile} style={{ display: "none" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: theme.borderLight }} /><span style={{ fontSize: 11, color: theme.textTertiary }}>OR</span><div style={{ flex: 1, height: 1, background: theme.borderLight }} />
          </div>
          <button onClick={runDemo} style={{ padding: "14px 28px", borderRadius: theme.radiusPill, border: "none", background: theme.blue, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", transition: `all ${theme.transition}`, letterSpacing: "-0.01em" }}
            onMouseOver={e => { e.currentTarget.style.background = theme.blueHover; }}
            onMouseOut={e => { e.currentTarget.style.background = theme.blue; }}>
            🏥 Try demo — Children's Health Plano Surgical Suite
          </button>
        </div>
      )}

      {/* Analyzing */}
      {step === "analyzing" && (
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "120px 20px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: theme.blue, animation: `pulse-ring 1.4s ease-in-out ${i*0.2}s infinite` }} />)}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Reading the RFP...</h2>
          <p style={{ fontSize: 13, color: theme.textSecondary }}>Checking against your projects, certs, and crew</p>
        </div>
      )}

      {/* Results */}
      {step === "results" && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 24px 160px" }}>

          {/* Analysis card */}
          {showAnalysis && (
            <div style={{ background: theme.bgCard, borderRadius: theme.radiusLg, padding: "28px 32px", marginBottom: 20, boxShadow: theme.shadowMd }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>📋</span><h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>RFP Analysis</h2></div>
                <span style={{ fontSize: 11, color: theme.blue, background: theme.blueLight, padding: "4px 12px", borderRadius: theme.radiusPill, fontWeight: 600 }}>Step 1</span>
              </div>
              <RenderAnalysis text={showAnalysis} />
              {typing && typingFor === "analysis" && <span style={{ display: "inline-block", width: 2, height: 16, background: theme.blue, animation: "blink 0.8s infinite" }} />}
            </div>
          )}

          {/* Generate button */}
          {analysis && !bidDoc && !typing && (
            <button onClick={generateDemoBid} style={{ width: "100%", padding: "18px", borderRadius: theme.radiusMd, border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer", background: theme.blue, color: "#fff", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,113,227,0.3)", transition: `all ${theme.transition}`, letterSpacing: "-0.01em" }}>
              📝 Generate full bid response
            </button>
          )}

          {/* Bid document */}
          {showBid && (
            <div ref={bidRef} style={{ background: theme.bgCard, borderRadius: theme.radiusLg, padding: "32px 36px", marginBottom: 20, boxShadow: theme.shadowMd }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>📝</span><h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Your Bid Response</h2></div>
                <div style={{ display: "flex", gap: 6 }}>
                  {bidDoc && <span style={{ fontSize: 11, color: theme.statusGreenText, background: theme.statusGreenBg, padding: "4px 12px", borderRadius: theme.radiusPill, fontWeight: 600 }}>Complete</span>}
                  {bidDoc && <button onClick={() => navigator.clipboard.writeText(bidDoc)} style={{ fontSize: 11, color: theme.textSecondary, background: theme.divider, padding: "4px 12px", borderRadius: theme.radiusPill, border: "none", cursor: "pointer" }}>Copy</button>}
                  {typing && typingFor === "bid" && <span style={{ fontSize: 11, color: theme.blue, background: theme.blueLight, padding: "4px 12px", borderRadius: theme.radiusPill, fontWeight: 600 }}>Generating...</span>}
                </div>
              </div>
              <RenderMD text={showBid} />
              {typing && typingFor === "bid" && <span style={{ display: "inline-block", width: 2, height: 16, background: theme.blue, animation: "blink 0.8s infinite" }} />}
            </div>
          )}

          {/* Suggestions */}
          {(analysis || bidDoc) && !typing && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, marginBottom: 8 }}>{bidDoc ? "REFINE YOUR BID" : "ASK ABOUT THIS RFP"}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {suggestions.map((q, i) => (
                  <button key={i} onClick={() => askFollowUp(q)} style={{ padding: "12px 16px", borderRadius: theme.radiusMd, border: `1px solid ${theme.borderLight}`, background: theme.bgCard, fontSize: 13, color: theme.textPrimary, textAlign: "left", cursor: "pointer", lineHeight: 1.5, transition: `all ${theme.transition}`, boxShadow: theme.shadowSm }}
                    onMouseOver={e => e.currentTarget.style.borderColor = theme.blue} onMouseOut={e => e.currentTarget.style.borderColor = theme.borderLight}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 14, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "user"
                ? <div style={{ maxWidth: "75%", background: theme.blue, color: "#fff", padding: "12px 18px", borderRadius: "18px 18px 4px 18px", fontSize: 14, lineHeight: 1.6 }}>{msg.text}</div>
                : <div style={{ maxWidth: "88%", background: theme.divider, borderRadius: "4px 18px 18px 18px", padding: "16px 20px", fontSize: 14, lineHeight: 1.7, color: theme.textPrimary, whiteSpace: "pre-wrap" }}>{msg.text}</div>
              }
            </div>
          ))}
          {loading && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0" }}>{[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: theme.blue, animation: `pulse-ring 1.4s ease-in-out ${i*0.2}s infinite` }} />)}<span style={{ fontSize: 12, color: theme.textSecondary }}>Thinking...</span></div>}
          <div ref={endRef} />

          {/* Input bar — frosted glass */}
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(245,245,247,0.72)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", borderTop: "1px solid rgba(0,0,0,0.06)", padding: "12px 24px" }}>
            <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") askFollowUp(input); }}
                placeholder={bidDoc ? "Ask to change pricing, rewrite a section..." : "Ask anything about this RFP..."}
                style={{ flex: 1, padding: "12px 16px", borderRadius: theme.radiusPill, border: `1px solid ${theme.borderLight}`, background: theme.bgCard, fontSize: 14, outline: "none", color: theme.textPrimary, boxShadow: theme.shadowInput, transition: `border-color ${theme.transition}, box-shadow ${theme.transition}` }}
                onFocus={e => { e.target.style.borderColor = theme.blue; e.target.style.boxShadow = "0 0 0 3px rgba(0,113,227,0.15)"; }} onBlur={e => { e.target.style.borderColor = theme.borderLight; e.target.style.boxShadow = theme.shadowInput; }} />
              <button onClick={() => askFollowUp(input)} disabled={!input.trim() || loading} style={{ padding: "12px 20px", borderRadius: theme.radiusPill, border: "none", fontWeight: 600, fontSize: 14, background: input.trim() ? theme.blue : theme.borderLight, color: input.trim() ? "#fff" : theme.textTertiary, cursor: input.trim() ? "pointer" : "default", transition: `all ${theme.transition}` }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
