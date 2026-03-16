/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useEffect } from "react";

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
            <tr style={{ background: "#f8f7f5" }}>
              {headerCells.map((c, i) => (
                <th key={i} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, borderBottom: "2px solid #e8e5e0", color: "#1a1a18", fontSize: 12, whiteSpace: "nowrap" }}>{c.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => {
              const cells = row.split("|").filter(c => c.trim());
              return (
                <tr key={ri} style={{ background: ri % 2 === 1 ? "#fafaf8" : "#fff" }}>
                  {cells.map((c, ci) => {
                    const val = c.trim();
                    const isNum = /^\$|^\d/.test(val) || /^\*\*\$/.test(val);
                    const isBold = val.startsWith("**") && val.endsWith("**");
                    const display = isBold ? val.slice(2, -2) : val;
                    return (
                      <td key={ci} style={{ padding: "7px 12px", borderBottom: "1px solid #f1f0ec", color: "#2d2d2a", textAlign: isNum && ci > 0 ? "right" : "left", fontWeight: isBold ? 700 : 400, fontFamily: isNum ? "'JetBrains Mono', monospace" : "inherit", fontSize: isNum ? 12.5 : 13 }}>{display}</td>
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
      elements.push(<hr key={key++} style={{ border: "none", borderTop: "1px solid #e8e5e0", margin: "20px 0" }} />);
      continue;
    }

    // Headers
    if (trimmed.startsWith("# ")) {
      elements.push(<h1 key={key++} style={{ fontSize: 22, fontWeight: 700, margin: "28px 0 8px", color: "#1a1a18", letterSpacing: "-0.02em" }}>{trimmed.slice(2)}</h1>);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      const num = trimmed.match(/^## (\d+)\./);
      elements.push(
        <h2 key={key++} style={{ fontSize: 16, fontWeight: 700, margin: "24px 0 8px", color: "#1a1a18", padding: "10px 0 6px", borderBottom: "2px solid #ea580c", display: "flex", alignItems: "center", gap: 8 }}>
          {num && <span style={{ background: "#ea580c", color: "#fff", width: 24, height: 24, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{num[1]}</span>}
          {num ? trimmed.slice(trimmed.indexOf(".") + 2) : trimmed.slice(3)}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={key++} style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 6px", color: "#4a4540" }}>{trimmed.slice(4)}</h3>);
      continue;
    }

    // Empty line
    if (trimmed === "") {
      elements.push(<div key={key++} style={{ height: 6 }} />);
      continue;
    }

    // Bold-only lines
    if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.includes("**", 2)) {
      elements.push(<p key={key++} style={{ fontSize: 13.5, fontWeight: 700, margin: "12px 0 4px", color: "#1a1a18", lineHeight: 1.5 }}>{trimmed.slice(2, -2)}</p>);
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
      if (part) spans.push(<span key={spans.length} style={bold ? { fontWeight: 600, color: "#1a1a18" } : {}}>{part}</span>);
    }

    elements.push(<p key={key++} style={{ fontSize: 13.5, lineHeight: 1.7, margin: "3px 0", color: "#2d2d2a" }}>{spans}</p>);
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
      const color = t.startsWith("✅") ? "#166534" : t.startsWith("❌") ? "#991b1b" : "#92400e";
      const bg = t.startsWith("✅") ? "#dcfce7" : t.startsWith("❌") ? "#fee2e2" : "#fef3c7";
      elements.push(<div key={key++} style={{ background: bg, color, padding: "12px 16px", borderRadius: 10, fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>{t}</div>);
      continue;
    }

    if (t === "REQUIREMENTS MATCH" || t === "SCORECARD" || t === "TOP 3 RISKS" || t.startsWith("ESTIMATED PRICE") || t === "REFINE YOUR BID" || t === "ASK ABOUT THIS RFP") {
      elements.push(<p key={key++} style={{ fontSize: 11, fontWeight: 700, color: "#8b8680", textTransform: "uppercase", letterSpacing: "0.06em", margin: "18px 0 8px", borderBottom: "1px solid #f1f0ec", paddingBottom: 6 }}>{t}</p>);
      continue;
    }

    if (t.startsWith("✅") || t.startsWith("⚠️") || t.startsWith("❌")) {
      const icon = t.slice(0, 2);
      const rest = t.slice(2).trim().replace(/—/, "").trim();
      const [label, ...desc] = rest.split("—").length > 1 ? rest.split("—") : rest.split(" — ");
      const bg = icon === "✅" ? "#f0fdf4" : icon === "⚠️" ? "#fffbeb" : "#fef2f2";
      const border = icon === "✅" ? "#bbf7d0" : icon === "⚠️" ? "#fde68a" : "#fecaca";
      elements.push(
        <div key={key++} style={{ display: "flex", gap: 10, padding: "8px 12px", background: bg, border: `1px solid ${border}`, borderRadius: 8, margin: "4px 0", fontSize: 13, lineHeight: 1.5 }}>
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
            <span style={{ width: 22, height: 22, borderRadius: 6, background: "#f1f0ec", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#6b6560", flexShrink: 0 }}>{num}</span>
            <span style={{ flex: 1 }}><strong>{label}</strong></span>
            <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
              {[1,2,3,4,5].map(j => <div key={j} style={{ width: 8, height: 8, borderRadius: 2, background: j <= n ? "#ea580c" : "#e8e5e0" }} />)}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#ea580c", minWidth: 28, textAlign: "right" }}>{score}</span>
          </div>
        );
        if (desc.length) elements.push(<p key={key++} style={{ fontSize: 12, color: "#6b6560", margin: "0 0 4px", paddingLeft: 32 }}>{desc.join("—")}</p>);
        continue;
      }
    }

    if (t.startsWith("Total:")) {
      elements.push(<div key={key++} style={{ background: "#1a1a18", color: "#fff", padding: "10px 16px", borderRadius: 8, fontSize: 15, fontWeight: 700, margin: "10px 0", display: "flex", justifyContent: "space-between" }}>
        <span>{t.split("—")[0].trim()}</span>
        <span style={{ color: "#fbbf24" }}>{t.split("—")[1]?.trim() || ""}</span>
      </div>);
      continue;
    }

    elements.push(<p key={key++} style={{ fontSize: 13.5, lineHeight: 1.6, margin: "3px 0", color: "#2d2d2a" }}>{t}</p>);
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
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#fafaf8", minHeight: "100vh", color: "#1a1a18" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ background: "#fff", borderBottom: "1px solid #e8e5e0", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={reset}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>IF</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Ironflow AI</span>
        </div>
        {step !== "upload" && <button onClick={reset} style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #e8e5e0", background: "#fff", color: "#6b6560", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>New RFP</button>}
      </div>

      {step === "upload" && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "56px 20px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 24, margin: "0 auto 20px" }}>IF</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>Upload an RFP</h1>
          <p style={{ fontSize: 15, color: "#6b6560", margin: "0 0 32px", lineHeight: 1.5 }}>We'll check if you can do the job, then<br/>draft your complete bid response.</p>
          <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed #d4d0ca", borderRadius: 16, padding: "44px 32px", cursor: "pointer", transition: "all 0.2s", marginBottom: 16, background: "#fff" }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "#ea580c"; e.currentTarget.style.background = "#fef7f4"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "#d4d0ca"; e.currentTarget.style.background = "#fff"; }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Drop your RFP here, or click to browse</p>
            <p style={{ fontSize: 12, color: "#8b8680", margin: 0 }}>Supports .txt, .md files</p>
            <input ref={fileRef} type="file" accept=".txt,.md" onChange={handleFile} style={{ display: "none" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e8e5e0" }} /><span style={{ fontSize: 11, color: "#a8a39e" }}>OR</span><div style={{ flex: 1, height: 1, background: "#e8e5e0" }} />
          </div>
          <button onClick={runDemo} style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid #ea580c", background: "#fff", color: "#ea580c", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%", transition: "all 0.15s" }}
            onMouseOver={e => { e.currentTarget.style.background = "#ea580c"; e.currentTarget.style.color = "#fff"; }}
            onMouseOut={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#ea580c"; }}>
            🏥 Try demo — Children's Health Plano Surgical Suite
          </button>
        </div>
      )}

      {step === "analyzing" && (
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "100px 20px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#ea580c", animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>Reading the RFP...</h2>
          <p style={{ fontSize: 13, color: "#6b6560" }}>Checking against your projects, certs, and crew</p>
        </div>
      )}

      {step === "results" && (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 20px 140px" }}>

          {/* Analysis card */}
          {showAnalysis && (
            <div style={{ background: "#fff", border: "1px solid #e8e5e0", borderRadius: 14, padding: "22px 26px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>📋</span><h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>RFP Analysis</h2></div>
                <span style={{ fontSize: 11, color: "#8b8680", background: "#f1f0ec", padding: "3px 10px", borderRadius: 6 }}>Step 1</span>
              </div>
              <RenderAnalysis text={showAnalysis} />
              {typing && typingFor === "analysis" && <span style={{ display: "inline-block", width: 2, height: 16, background: "#ea580c", animation: "blink 0.8s infinite" }} />}
            </div>
          )}

          {/* Generate button */}
          {analysis && !bidDoc && !typing && (
            <button onClick={generateDemoBid} style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", background: "#ea580c", color: "#fff", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              📝 Generate full bid response
            </button>
          )}

          {/* Bid document */}
          {showBid && (
            <div ref={bidRef} style={{ background: "#fff", border: "1px solid #e8e5e0", borderRadius: 14, padding: "28px 32px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>📝</span><h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Your Bid Response</h2></div>
                <div style={{ display: "flex", gap: 6 }}>
                  {bidDoc && <span style={{ fontSize: 11, color: "#166534", background: "#dcfce7", padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>Complete</span>}
                  {bidDoc && <button onClick={() => navigator.clipboard.writeText(bidDoc)} style={{ fontSize: 11, color: "#6b6560", background: "#f1f0ec", padding: "3px 10px", borderRadius: 6, border: "none", cursor: "pointer" }}>Copy</button>}
                  {typing && typingFor === "bid" && <span style={{ fontSize: 11, color: "#ea580c", background: "#fef3eb", padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>Generating...</span>}
                </div>
              </div>
              <RenderMD text={showBid} />
              {typing && typingFor === "bid" && <span style={{ display: "inline-block", width: 2, height: 16, background: "#ea580c", animation: "blink 0.8s infinite" }} />}
            </div>
          )}

          {/* Suggestions */}
          {(analysis || bidDoc) && !typing && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#8b8680", marginBottom: 8 }}>{bidDoc ? "REFINE YOUR BID" : "ASK ABOUT THIS RFP"}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {suggestions.map((q, i) => (
                  <button key={i} onClick={() => askFollowUp(q)} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e8e5e0", background: "#fff", fontSize: 12.5, color: "#3d3d3a", textAlign: "left", cursor: "pointer", lineHeight: 1.4, transition: "all 0.15s" }}
                    onMouseOver={e => e.currentTarget.style.borderColor = "#ea580c"} onMouseOut={e => e.currentTarget.style.borderColor = "#e8e5e0"}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 14, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "user"
                ? <div style={{ maxWidth: "80%", background: "#ea580c", color: "#fff", padding: "10px 16px", borderRadius: "16px 16px 4px 16px", fontSize: 13.5, lineHeight: 1.6 }}>{msg.text}</div>
                : <div style={{ maxWidth: "92%", background: "#fff", border: "1px solid #e8e5e0", borderRadius: "4px 16px 16px 16px", padding: "16px 20px", fontSize: 13.5, lineHeight: 1.7, color: "#2d2d2a", whiteSpace: "pre-wrap" }}>{msg.text}</div>
              }
            </div>
          ))}
          {loading && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0" }}>{[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#ea580c", animation: `bounce 1s ease-in-out ${i*0.15}s infinite` }} />)}<span style={{ fontSize: 12, color: "#8b8680" }}>Thinking...</span></div>}
          <div ref={endRef} />

          {/* Input */}
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fafaf8", borderTop: "1px solid #e8e5e0", padding: "10px 20px" }}>
            <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") askFollowUp(input); }}
                placeholder={bidDoc ? "Ask to change pricing, rewrite a section..." : "Ask anything about this RFP..."}
                style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1px solid #e8e5e0", background: "#fff", fontSize: 13.5, outline: "none", color: "#1a1a18" }}
                onFocus={e => e.target.style.borderColor = "#ea580c"} onBlur={e => e.target.style.borderColor = "#e8e5e0"} />
              <button onClick={() => askFollowUp(input)} disabled={!input.trim() || loading} style={{ padding: "11px 18px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 13.5, background: input.trim() ? "#ea580c" : "#e8e5e0", color: input.trim() ? "#fff" : "#a8a39e", cursor: input.trim() ? "pointer" : "default" }}>Send</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-5px);opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        *{box-sizing:border-box;margin:0}input::placeholder{color:#b5b0a8}button:active{transform:scale(.97)}
      `}</style>
    </div>
  );
}
