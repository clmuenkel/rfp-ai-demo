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
  bgDesk: "#e8e8ed",
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
  shadowPaper: "0 2px 16px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.08)",
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

/* ── Markdown renderer (bid document) ── */
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
    const dataRows = tableRows.slice(2);
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
    if (trimmed.startsWith("|")) { if (!inTable) inTable = true; tableRows.push(trimmed); continue; } else if (inTable) { flushTable(); }
    if (trimmed === "---" || trimmed === "***") { elements.push(<hr key={key++} style={{ border: "none", borderTop: `1px solid ${theme.divider}`, margin: "20px 0" }} />); continue; }
    if (trimmed.startsWith("# ")) { elements.push(<h1 key={key++} style={{ fontSize: 22, fontWeight: 700, margin: "28px 0 8px", color: theme.textPrimary, letterSpacing: "-0.03em" }}>{trimmed.slice(2)}</h1>); continue; }
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
    if (trimmed.startsWith("### ")) { elements.push(<h3 key={key++} style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 6px", color: theme.textSecondary }}>{trimmed.slice(4)}</h3>); continue; }
    if (trimmed === "") { elements.push(<div key={key++} style={{ height: 6 }} />); continue; }
    if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.includes("**", 2)) { elements.push(<p key={key++} style={{ fontSize: 13.5, fontWeight: 700, margin: "12px 0 4px", color: theme.textPrimary, lineHeight: 1.5 }}>{trimmed.slice(2, -2)}</p>); continue; }
    const formatted = trimmed.replace(/\*\*(.+?)\*\*/g, "⟪B⟫$1⟪/B⟫").split(/(⟪\/?B⟫)/g);
    const spans: any[] = [];
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

/* ── Analysis renderer (requirements, scorecard, risks) ── */
function StatusBadge({ type }: { type: "pass" | "warn" | "risk" }) {
  const map = {
    pass: { label: "PASS", bg: theme.statusGreenBg, color: theme.statusGreenText, border: theme.statusGreenBorder },
    warn: { label: "WARN", bg: theme.statusYellowBg, color: theme.statusYellowText, border: theme.statusYellowBorder },
    risk: { label: "RISK", bg: theme.statusRedBg, color: theme.statusRedText, border: theme.statusRedBorder },
  };
  const s = map[type];
  return <span style={{ padding: "2px 8px", borderRadius: theme.radiusPill, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: s.bg, color: s.color, border: `1px solid ${s.border}`, flexShrink: 0 }}>{s.label}</span>;
}

function RenderAnalysis({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements: any[] = [];
  let key = 0;

  for (const line of lines) {
    const t = line.trim();
    if (!t) { elements.push(<div key={key++} style={{ height: 6 }} />); continue; }

    // Decision callout
    if (t.startsWith("✅ You should") || t.startsWith("❌ Skip") || t.startsWith("⚠️ This is")) {
      const type = t.startsWith("✅") ? "pass" : t.startsWith("❌") ? "risk" : "warn";
      const color = type === "pass" ? theme.statusGreenText : type === "risk" ? theme.statusRedText : theme.statusYellowText;
      const bg = type === "pass" ? theme.statusGreenBg : type === "risk" ? theme.statusRedBg : theme.statusYellowBg;
      const border = type === "pass" ? theme.statusGreenBorder : type === "risk" ? theme.statusRedBorder : theme.statusYellowBorder;
      const cleanText = t.replace(/^[✅❌⚠️]\s*/, "");
      elements.push(
        <div key={key++} style={{ background: bg, color, border: `1px solid ${border}`, padding: "14px 20px", borderRadius: theme.radiusMd, fontSize: 15, fontWeight: 600, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge type={type} />
          <span>{cleanText}</span>
        </div>
      );
      continue;
    }

    // Section headers
    if (t === "REQUIREMENTS MATCH" || t === "SCORECARD" || t === "TOP 3 RISKS" || t.startsWith("ESTIMATED PRICE") || t === "REFINE YOUR BID" || t === "ASK ABOUT THIS RFP") {
      elements.push(<p key={key++} style={{ fontSize: 11, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em", margin: "24px 0 10px", borderBottom: `1px solid ${theme.divider}`, paddingBottom: 8 }}>{t}</p>);
      continue;
    }

    // Status items with badge indicators
    if (t.startsWith("✅") || t.startsWith("⚠️") || t.startsWith("❌")) {
      const icon = t.slice(0, 2);
      const type: "pass" | "warn" | "risk" = icon === "✅" ? "pass" : icon === "⚠️" ? "warn" : "risk";
      const rest = t.slice(2).trim().replace(/—/, "").trim();
      const [label, ...desc] = rest.split("—").length > 1 ? rest.split("—") : rest.split(" — ");
      const bg = type === "pass" ? theme.statusGreenBg : type === "warn" ? theme.statusYellowBg : theme.statusRedBg;
      const border = type === "pass" ? theme.statusGreenBorder : type === "warn" ? theme.statusYellowBorder : theme.statusRedBorder;
      elements.push(
        <div key={key++} style={{ display: "flex", gap: 10, padding: "10px 14px", background: bg, border: `1px solid ${border}`, borderRadius: 10, margin: "5px 0", fontSize: 13, lineHeight: 1.6, alignItems: "flex-start" }}>
          <StatusBadge type={type} />
          <span style={{ flex: 1 }}>{desc.length ? <><strong>{label.trim()}</strong> — {desc.join("—").trim()}</> : rest}</span>
        </div>
      );
      continue;
    }

    // Scorecard items
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

    // Total score
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

/* ── RFP Document renderer (paper-style) ── */
function RenderRFPDocument({ text }: { text: string }) {
  if (!text) return null;

  // Parse sections separated by blank lines, first line is title
  const blocks = text.split("\n\n").map(b => b.trim()).filter(Boolean);
  const elements: any[] = [];
  let key = 0;

  for (const block of blocks) {
    // SECTION HEADERS (all-caps lines like "SCOPE OF WORK", "PROJECT DETAILS")
    if (/^[A-Z][A-Z &\/]+$/.test(block.trim())) {
      elements.push(
        <p key={key++} style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.1em", margin: "28px 0 12px", borderTop: `1px solid ${theme.borderLight}`, paddingTop: 20 }}>{block}</p>
      );
      continue;
    }

    // TITLE LINE: "INVITATION TO BID: ..."
    const titleMatch = block.match(/^INVITATION TO BID:\s*(.+)/i);
    if (titleMatch) {
      elements.push(
        <div key={key++} style={{ borderBottom: `2px solid ${theme.textPrimary}`, paddingBottom: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Invitation to Bid</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.textPrimary, letterSpacing: "-0.02em", lineHeight: 1.3, margin: 0 }}>{titleMatch[1]}</h1>
        </div>
      );
      continue;
    }

    // PIPE-DELIMITED FIELDS: "GC: Foo | Bid Date: Bar | ..."
    if (block.includes("|") && block.includes(":")) {
      const parts = block.split("|").map(p => p.trim()).filter(Boolean);
      const fields: { label: string; value: string }[] = [];
      for (const part of parts) {
        const colonIdx = part.indexOf(":");
        if (colonIdx > 0) {
          fields.push({ label: part.slice(0, colonIdx).trim(), value: part.slice(colonIdx + 1).trim() });
        }
      }
      if (fields.length > 0) {
        elements.push(
          <div key={key++} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 40px", marginBottom: 20 }}>
            {fields.map((f, i) => (
              <div key={i}>
                <p style={{ fontSize: 10, fontWeight: 600, color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{f.label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary, margin: 0 }}>{f.value}</p>
              </div>
            ))}
          </div>
        );
        continue;
      }
    }

    // NUMBERED OR BULLETED ITEMS
    const listLines = block.split("\n").filter(l => /^[\d•\-]/.test(l.trim()));
    if (listLines.length > 1) {
      elements.push(
        <div key={key++} style={{ margin: "8px 0 16px" }}>
          {block.split("\n").map((line, i) => {
            const t = line.trim();
            if (!t) return null;
            const bullet = /^[\d]+[.)]\s*/.test(t) || /^[•\-]\s*/.test(t);
            const cleaned = t.replace(/^[\d]+[.)]\s*/, "").replace(/^[•\-]\s*/, "");
            return bullet ? (
              <div key={i} style={{ display: "flex", gap: 8, padding: "4px 0", fontSize: 13.5, lineHeight: 1.6, color: theme.textPrimary }}>
                <span style={{ color: theme.textTertiary, flexShrink: 0 }}>•</span>
                <span>{cleaned}</span>
              </div>
            ) : (
              <p key={i} style={{ fontSize: 13.5, lineHeight: 1.6, color: theme.textPrimary, margin: "4px 0" }}>{t}</p>
            );
          })}
        </div>
      );
      continue;
    }

    // REGULAR PARAGRAPHS
    elements.push(<p key={key++} style={{ fontSize: 13.5, lineHeight: 1.7, color: theme.textPrimary, margin: "8px 0" }}>{block}</p>);
  }

  // Page footer
  elements.push(
    <div key={key++} style={{ marginTop: 48, paddingTop: 16, borderTop: `1px solid ${theme.borderLight}`, textAlign: "center" }}>
      <p style={{ fontSize: 10, color: theme.textTertiary }}>RFP Document — 20 pages</p>
    </div>
  );

  return <>{elements}</>;
}

/* ── Bid Summary metrics (right panel on bid step) ── */
function RenderBidSummary() {
  return (
    <div style={{ marginBottom: 20 }}>
      {/* Score */}
      <div style={{ background: theme.textPrimary, color: "#fff", padding: "14px 20px", borderRadius: theme.radiusMd, fontSize: 15, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span>Bid Score</span>
        <span style={{ color: "#ffd60a" }}>43/50 — STRONG BID</span>
      </div>

      {/* Price */}
      <div style={{ background: theme.bgCard, borderRadius: theme.radiusMd, padding: "16px 20px", boxShadow: theme.shadowSm, marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total Base Bid</p>
        <p style={{ fontSize: 24, fontWeight: 700, color: theme.textPrimary, margin: 0, fontFamily: theme.fontMono }}>$98,400</p>
      </div>

      {/* Status pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {[
          { label: "Crew Available", type: "pass" as const },
          { label: "Licensed & Insured", type: "pass" as const },
          { label: "EMR 0.78", type: "pass" as const },
          { label: "New PM Firm", type: "warn" as const },
          { label: "8-wk Schedule", type: "pass" as const },
        ].map((item, i) => {
          const colors = item.type === "pass"
            ? { bg: theme.statusGreenBg, color: theme.statusGreenText, border: theme.statusGreenBorder }
            : { bg: theme.statusYellowBg, color: theme.statusYellowText, border: theme.statusYellowBorder };
          return (
            <span key={i} style={{ padding: "4px 10px", borderRadius: theme.radiusPill, fontSize: 11, fontWeight: 600, background: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}>{item.label}</span>
          );
        })}
      </div>
    </div>
  );
}

/* ── Data constants ── */
const PREBAKED_ANALYSIS = `✅ You should bid on this.

This is a bread-and-butter commercial plumbing remodel — almost identical to the Legacy West restaurant build-outs you did last year. Great fit.

REQUIREMENTS MATCH

✅ TX Master Plumber license — Carlos Espinoza holds MP-38824, active through 2027.
✅ Commercial plumbing experience (3+ yrs) — You have 12+ years of commercial work across 40+ projects.
✅ Insurance requirements — Your $2M GL + $5M umbrella exceeds their $1M/$2M minimums.
✅ Bonding capacity — Project est. $85–110K, well within your $8M single limit.
✅ Prevailing wage — Davis-Bacon is standard for you. Certified payroll set up.
✅ Grease interceptor experience — Installed 12 grease traps for Legacy West restaurant row ($1.6M project).
⚠️ Whitmore Property Group — New PM firm for you. Mid-size but no existing relationship yet.
✅ 8-week timeline — Legacy West restaurant build-outs averaged 5 weeks each. Very doable.
✅ ADA compliance — Frisco ISD project had 42 ADA fixture groups. You know the code.
⚠️ Weekend/after-hours work — May be required to avoid disrupting adjacent tenants. Adds OT cost.

SCORECARD

1. Right size? — 5/5 — Est. $85–110K, sweet spot for your crew size
2. Scope match? — 5/5 — Commercial plumbing remodel is your bread and butter
3. Crew available? — 4/5 — Daniel Torres and team free mid-May, Roberto wrapping McKinney
4. PM relationship? — 3/5 — Whitmore is new but you have strong comparable refs
5. Sector experience? — 5/5 — Extensive restaurant and retail plumbing history
6. Schedule risk? — 4/5 — 8 weeks is comfortable based on similar scope
7. Competition? — 4/5 — Licensed shops with grease trap experience are limited
8. Bonding? — 5/5 — Well within capacity
9. Geography? — 5/5 — Frisco TX, 20 min from your office
10. Strategic value? — 3/5 — Good repeat potential if Whitmore develops more retail

Total: 43/50 — STRONG BID

TOP 3 RISKS
1. New relationship with Whitmore Property Group — mitigate with strong Rogers-O'Brien and Skanska references.
2. After-hours work requirement could push labor costs 15–20% on some phases — price accordingly.
3. Existing building conditions unknown — old slab plumbing may add demo and rerouting scope.

ESTIMATED PRICE RANGE: $85,000 – $110,000
Based on Legacy West restaurant build-outs ($38–52K per unit) scaled to 3,200 SF with full kitchen and bar rough-in.`;

const PREBAKED_BID = `# Ironflow Mechanical, Inc. — Bid Response
## The Warren at Hall Park — Restaurant Plumbing Remodel (WHP-2026-PLM)
## Submitted: May 20, 2026

---

## 1. Executive Summary

Ironflow Mechanical is pleased to submit this proposal for the complete plumbing rough-in and finish for the restaurant tenant space at The Warren at Hall Park. With over 12 years of commercial plumbing experience and a strong track record in restaurant and food-service build-outs — including **six restaurant spaces at Legacy West** totaling **$1.6M** — we bring proven capability for this scope.

**Foreman Daniel Torres**, who led our Legacy West restaurant plumbing work, is available for mobilization in mid-May. Daniel has installed grease interceptors, commercial kitchen rough-ins, and bar plumbing for over 20 restaurant spaces in the DFW area. Our team understands the unique demands of food-service plumbing — proper grease management, indirect waste connections, and health department compliance.

We are committed to completing this project within the 8-week timeline while working around adjacent occupied tenants as needed.

---

## 2. Bid Pricing

### Base Bid

| Line Item | Amount |
|---|---|
| Plumbing Rough-In (Kitchen + Bar + Restrooms) | $52,400 |
| Grease Interceptor & Waste Lines | $14,800 |
| Fixture Installation & Trim | $18,200 |
| Testing, Inspections & Closeout | $4,600 |
| **Total Base Bid** | **$90,000** |

### Alternates

| Item | Amount |
|---|---|
| Alt #1 — Tankless water heater upgrade (Rinnai commercial) | $4,200 |
| Alt #2 — Point-of-use hot water recirculation (bar area) | $2,800 |
| Alt #3 — Floor sink with indirect waste for walk-in cooler | $1,400 |

### Labor Breakdown

| Classification | Hours | Rate | Extended |
|---|---|---|---|
| Foreman | 320 | $68.00/hr | $21,760 |
| Journeyman Plumber | 480 | $58.00/hr | $27,840 |
| Apprentice (3rd year) | 240 | $38.00/hr | $9,120 |
| **Total Labor** | **1,040** | | **$58,720** |

### Material Breakdown

| Category | Amount |
|---|---|
| Copper pipe and fittings (Type L) | $6,200 |
| Cast iron pipe (no-hub) | $3,400 |
| PVC DWV pipe and fittings | $2,100 |
| Grease interceptor (50 GPM, Schier GB-50) | $3,800 |
| Commercial fixtures (sinks, faucets, floor drains) | $8,400 |
| Water heater (AO Smith 75-gal commercial) | $2,600 |
| Backflow preventer (Watts 009) | $1,200 |
| Hangers, supports, insulation, sealants | $1,580 |
| **Total Material** | **$29,280** |

### Overhead

| Item | Amount |
|---|---|
| Permit fees (City of Frisco) | $1,200 |
| Bond premium | $400 |
| Mobilization & cleanup | $800 |
| OH&P | $5,200 |
| **Total Overhead** | **$7,600** |

---

## 3. Qualifications & Experience

**Legacy West — Restaurant Row Build-Outs (6 units)**
$1,600,000 | PM: Trademark Property | 2024–2025
Full plumbing for six restaurant tenant spaces including commercial kitchens, bars, and restrooms. Grease interceptors, indirect waste, hood wash connections. Completed all units on schedule.

**Baylor Scott & White McKinney — Medical Office Building**
$1,180,000 | GC: Skanska | 2023
90,000 SF. Full plumbing including ADA restrooms, break rooms, and lab fixtures.

**Frisco ISD — Lone Star High School**
$892,000 | GC: Pogue Construction | 2024
42 ADA fixture groups, 14 restrooms. Completed in 7 of 8 available weeks.

**Amazon DFW3 — Warehouse Break Rooms**
$420,000 | GC: Clayco | 2024
12 break room plumbing rough-ins across 180,000 SF distribution center. Tight timeline, zero punch items.

---

## 4. Proposed Project Team

| Role | Name | Experience | Certifications |
|---|---|---|---|
| Project Manager | Carlos Espinoza | 18 years | Master Plumber MP-38824, OSHA 30 |
| Foreman | Daniel Torres | 10 years | Journeyman Plumber, OSHA 30 |
| Journeyman | Miguel Sanchez | 9 years | Journeyman Plumber, OSHA 10 |
| Apprentice | Luis Ramirez | 6 years | 3rd Year Apprentice, OSHA 10 |

---

## 5. Safety Record

| Metric | Ironflow | Industry Avg |
|---|---|---|
| EMR (current) | 0.74 | 1.00 |
| EMR (3-year avg) | 0.78 | 1.00 |
| Lost-time incidents (2024) | 0 | — |
| Lost-time incidents (2025) | 0 | — |
| OSHA TRIR | 1.46 | 3.40 |

All supers and foremen hold OSHA 30. All field staff: OSHA 10 + CPR/First Aid. ISNetworld Grade A. Drug testing: pre-employment + random.

---

## 6. Schedule

| Phase | Weeks | Key Activities |
|---|---|---|
| Mobilization & Demo | 1 | Permits, demo existing plumbing, slab cutting |
| Underground Rough-In | 2–3 | Waste lines, grease interceptor, water service |
| Above-Slab Rough-In | 4–5 | Supply lines, vent stacks, gas piping stubs |
| Fixture & Trim | 6–7 | Kitchen sinks, bar sinks, faucets, restroom fixtures |
| Testing & Closeout | 8 | Pressure tests, health dept inspection, punch list |

Legacy West restaurant spaces (comparable scope) averaged 5 weeks each. The 8-week timeline provides comfortable margin.

---

## 7. References

| Client/PM | Contact | Project |
|---|---|---|
| Trademark Property | Sarah Chen, Dev. Mgr — (972) 555-0312 | Legacy West Restaurants ($1.6M) |
| Skanska USA | Jennifer Walsh, PM — (214) 555-0233 | Baylor S&W McKinney ($1.2M) |
| Pogue Construction | Mark Davis, PM — (469) 555-0177 | Frisco ISD ($892K) |`;

const COMPANY_CTX = `You are the AI for Ironflow Mechanical, a 38-person commercial plumbing contractor in Dallas, TX. Answer follow-ups using real company data. Be conversational and specific. Use real names and numbers.

Key data: $14.8M revenue, EMR 0.78, bonding $8M/$20M. Won: Legacy West Restaurants $1.6M, BSW McKinney $1.2M, Frisco ISD $892K, UTSW Lab $684K, Amazon DFW3 $420K. Lost: Parkland $5.1M (too big), Amazon DFW2 $440K (OT pricing). Rates: journeyman $58/hr ($82 burdened), foreman $68/hr. Margin avg 16.3%. Team: Roberto Vasquez (super), Daniel Torres (foreman), Carlos Espinoza (VP ops/PM, Master Plumber MP-38824), Miguel Sanchez (journeyman), Luis Ramirez (apprentice), Rachel Kim (estimating). Current project: The Warren at Hall Park restaurant plumbing remodel, ~$90K, 3,200 SF restaurant space, 8-week timeline.`;

const SAMPLE_RFP = `INVITATION TO BID: Plumbing — Restaurant Tenant Build-Out at The Warren at Hall Park

Owner: Whitmore Property Group | PM: Whitmore Property Group | Bid Date: May 22, 2026
Location: 3100 Hall Park Blvd, Frisco, TX 75034 | Size: 3,200 SF | Occupancy: Restaurant (A-2)

PROJECT OVERVIEW

The Warren at Hall Park is a 285,000 SF mixed-use development located at the southeast corner of Hall Park Boulevard and Parkwood Boulevard in Frisco, Texas. The project includes Class A office space, ground-floor retail, and restaurant tenants anchoring the street-level experience. The development was designed by HKS Architects with Balfour Beatty serving as general contractor for the core and shell. The building received its Certificate of Occupancy in January 2026.

This Invitation to Bid covers the complete plumbing scope for Suite 110, a new full-service restaurant tenant space on the ground floor. The space will include a full commercial kitchen with hood, a bar area with ice bins, glass washers, and cocktail stations, two ADA-compliant restrooms (one male, one female), and a mop closet. The restaurant concept is a modern American brasserie with a projected seating capacity of 120 and an expected daily cover count of 250–300.

Whitmore Property Group is managing tenant coordination directly. The selected plumbing contractor will work alongside the tenant's general contractor (TBD), the HVAC contractor, and the electrical contractor. Close coordination will be required during the rough-in phase to avoid conflicts in the ceiling plenum, which has a finished height of 11'-6" with only 14" of plenum space.

SCOPE OF WORK

The plumbing contractor shall furnish all labor, materials, equipment, tools, transportation, permits, and supervision necessary for the complete plumbing installation as described below. All work shall comply with the International Plumbing Code (2021 edition) as adopted by the City of Frisco, Texas Department of Licensing and Regulation requirements, and all applicable local amendments.

1. DEMOLITION AND SITE PREPARATION
- Remove all existing plumbing within the tenant space, including abandoned waste lines, water stubs, and floor drains from previous tenant
- Saw-cut existing concrete slab as required for new underground routing (4" slab on grade with vapor barrier)
- Coordinate slab cuts with structural engineer of record (Datum Engineers) — no cuts within 24" of column footings
- Cap and abandon any existing lines not being reused, per code
- Protect all adjacent tenant spaces during demolition — dust barriers and noise mitigation required during business hours (7AM–6PM M-F)

2. UNDERGROUND ROUGH-IN
- Install new 4" sanitary waste main from kitchen area to existing building sanitary connection at Column Line G-7 (approximately 85 LF)
- Install new 3" sanitary waste branch lines to restroom groups (approximately 40 LF each)
- Install 2" grease waste line from kitchen fixtures to grease interceptor location (approximately 60 LF)
- Install new 1-1/2" domestic water service from existing 2" building water main at mechanical room (Room 108) to tenant space — approximately 120 LF
- Install 2" gas service stub from building gas meter to kitchen equipment manifold location — coordination with gas utility required
- All underground piping to be bedded in pea gravel with minimum 4" cover per City of Frisco requirements
- Concrete slab repair and patching after underground work — contractor to match existing slab finish and thickness

3. GREASE INTERCEPTOR
- Furnish and install exterior below-grade grease interceptor, minimum 50 GPM / 100 lb capacity
- Acceptable manufacturers: Schier Products (GB-50), Watts (GB-50), or approved equal
- Interceptor to be located in the designated utility area on the east side of the building (see Site Plan drawing C-101)
- Contractor responsible for excavation, bedding, backfill, and grade restoration at interceptor location
- Provide accessible cleanout at building penetration and at interceptor inlet
- Connect grease waste line to interceptor and route interceptor outlet to building sanitary main
- Flow control device required at interceptor inlet per City of Frisco ordinance 2024-08
- Provide maintenance access lid rated for H-20 traffic loading

4. ABOVE-SLAB PLUMBING ROUGH-IN
- Domestic cold water distribution: Type L copper throughout, with isolation valves at each fixture group and at the main branch takeoff. Minimum 60 PSI at furthest fixture.
- Domestic hot water distribution: Type L copper with 3/4" recirculation loop serving kitchen and bar areas. Insulate all hot water lines with 1" fiberglass per energy code.
- Sanitary waste and vent system: Cast iron (no-hub) for all waste and vent piping within the tenant space. PVC permitted only for underground applications.
- Acid waste: Not anticipated for this project. If required by tenant's equipment specifications, submit RFI before proceeding.
- All piping in ceiling plenum to be supported with clevis hangers at maximum 8' spacing for horizontal runs. Use riser clamps at all vertical penetrations.
- Provide firestopping at all penetrations through rated assemblies — UL-listed system required (Hilti CFS-S ACR or approved equal).
- Coordinate all ceiling-level rough-in with HVAC ductwork and electrical conduit. The ceiling plenum is limited to 14" — careful routing is critical.

5. PLUMBING FIXTURES
- Kitchen: One (1) 3-compartment sink with pre-rinse faucet (T&S Brass B-0133), one (1) prep sink (single bowl, 18"x18"), three (3) hand sinks with knee-valve faucets (as required by TDSHS), one (1) mop sink (24"x24" floor-mounted with 6" rim guard)
- Bar: One (1) bar sink (14"x16" underbar), two (2) glass washer connections with indirect waste, three (3) ice bin drains with indirect waste to floor sink, one (1) floor sink (12"x12") for indirect waste collection
- Restrooms (2 groups, ADA-compliant): Each group includes one (1) wall-hung lavatory (Sloan EHD-81000), one (1) water closet (Sloan?"Crown" 1.28 GPF flushometer), and required grab bars and clearances per ADA/TAS. Male restroom also includes one (1) urinal (Sloan SU-1009).
- Mop Closet: One (1) mop sink (24"x24"), one (1) hose bibb with vacuum breaker, one (1) floor drain
- All fixtures to be commercial grade. Final fixture selections subject to tenant approval — allowances included in bid for standard commercial grade.

6. WATER HEATER
- Furnish and install one (1) commercial gas water heater, minimum 75-gallon capacity, minimum 75,100 BTU input
- Acceptable manufacturers: AO Smith (BTH-300A), Rheem (GHE80-300A), or approved equal
- Install in designated mechanical area (Room 108-A) per plans
- Provide T&P relief valve discharge to floor drain — indirect connection per code
- Seismic strapping required per IPC and City of Frisco amendments
- Provide gas connection with dedicated shutoff, drip leg, and flexible connector
- Expansion tank required on cold water supply to heater
- If Alternate #1 (tankless) is accepted: substitute with Rinnai CU199iN commercial tankless units (2 in parallel) with recirculation pump and buffer tank

7. BACKFLOW PREVENTION
- Furnish and install reduced pressure zone (RPZ) backflow preventer on the domestic water service entrance to the tenant space
- Acceptable manufacturers: Watts (009 series), Wilkins (975XL), or approved equal
- Provide floor drain or indirect waste receptor beneath RPZ assembly
- Contractor responsible for initial testing and City of Frisco registration
- Provide annual test report and certification tags

8. TESTING AND INSPECTIONS
- Conduct DWV system test per IPC Section 312 — 10' head of water for 15 minutes minimum, all joints visible
- Conduct water supply pressure test — 150 PSI hydrostatic for 2 hours minimum with no drop
- Coordinate and schedule all required City of Frisco inspections: underground rough-in, above-slab rough-in, fixture final, and health department final
- Coordinate Collin County health department inspection for food-service establishment plumbing
- Provide all test reports, inspection records, and as-built drawings at project closeout
- Contractor to provide video documentation of all underground installations before backfill

GENERAL CONDITIONS

All work shall be performed by licensed plumbers under the direct supervision of a Texas Master Plumber. The Master Plumber shall be present on site during all rough-in inspections and the final inspection.

Working hours are Monday through Friday, 7:00 AM to 6:00 PM. Weekend and after-hours work may be required to avoid disruption to adjacent occupied tenants — this must be coordinated with Whitmore Property Group a minimum of 48 hours in advance. After-hours work will be compensated at the contractor's standard overtime rates as included in the bid.

The contractor shall maintain a clean and safe work area at all times. Daily cleanup is required. All debris shall be removed from the building via the designated loading dock at the east service entrance — do not transport debris through the main lobby or retail corridors.

The contractor shall protect all existing finishes, including polished concrete floors in common areas, glass storefronts, and elevator lobbies. Any damage caused by the plumbing contractor will be repaired at the contractor's expense.

INSURANCE AND BONDING REQUIREMENTS

- Commercial General Liability: $1,000,000 per occurrence / $2,000,000 aggregate
- Umbrella/Excess Liability: $2,000,000
- Automobile Liability: $1,000,000 combined single limit
- Workers' Compensation: Statutory limits with $1,000,000 employer's liability
- Builder's Risk: Provided by Owner — contractor to be named as additional insured
- Payment and Performance Bond: Required if contract exceeds $100,000
- All insurance certificates must name Whitmore Property Group and The Warren at Hall Park, LLC as additional insureds

SAFETY REQUIREMENTS

The contractor shall comply with all OSHA standards applicable to commercial construction. At minimum:
- All workers shall have completed OSHA 10-hour construction safety training
- Foreman or supervisor shall have completed OSHA 30-hour training
- Personal protective equipment (PPE) required at all times: hard hat, safety glasses, steel-toe boots
- Hot work permits required for all soldering and brazing — coordinate with building fire alarm system
- Contractor shall maintain a site-specific safety plan and make it available upon request
- Any OSHA-recordable incident must be reported to Whitmore Property Group within 4 hours

PREVAILING WAGE

This project is subject to prevailing wage requirements per the owner's financing agreements. The contractor shall pay no less than the prevailing wage rates as published by the Texas Workforce Commission for Collin County. Certified payroll records shall be submitted weekly to Whitmore Property Group.

SCHEDULE

Notice to Proceed: June 2, 2026 | Substantial Completion: July 28, 2026 (8 weeks)

- Week 1: Mobilization, demolition, slab cutting
- Weeks 2–3: Underground rough-in, grease interceptor installation
- Weeks 4–5: Above-slab rough-in (supply, waste, vent), water heater
- Weeks 6–7: Fixture installation, trim-out, backflow preventer
- Week 8: Testing, inspections, punch list, closeout

Liquidated damages of $500 per calendar day will apply for each day beyond the Substantial Completion date. Time extensions may be granted for documented force majeure events, owner-directed changes, or delays caused by other trades, subject to written approval by Whitmore Property Group.

SUBMITTAL REQUIREMENTS

The following shall be included with each bid submission:

1. Completed Bid Form (Attachment A) with all line items priced
2. List of at least three (3) comparable commercial plumbing projects completed in the past 5 years, including owner/GC name, contact information, contract value, and brief scope description
3. Resumes or qualifications for the proposed Project Manager and Foreman
4. Copy of current Texas Master Plumber license
5. Current EMR (Experience Modification Rate) letter from insurance carrier
6. Certificate of insurance meeting the requirements listed above
7. Preliminary project schedule showing major milestones and coordination points
8. List of proposed major equipment and fixture manufacturers
9. Acknowledgment of all addenda issued (if any)
10. Signed Bid Bond or bid security in the amount of 5% of total bid price

BID FORM

All bids shall be submitted on the Bid Form provided as Attachment A. Bids must be received by 2:00 PM Central Time on May 22, 2026 at the following address:

Whitmore Property Group
Attn: David Whitmore, Director of Development
3100 Hall Park Blvd, Suite 500
Frisco, TX 75034

Electronic submissions accepted at: bids@whitmorepropertygroup.com

A mandatory pre-bid site walk will be held on May 12, 2026 at 10:00 AM. Meet at the east service entrance. Bids from contractors who do not attend the pre-bid walk will not be accepted.

EVALUATION CRITERIA

Bids will be evaluated based on the following criteria (in order of priority):

1. Total bid price and completeness of pricing (40%)
2. Relevant project experience and references (25%)
3. Proposed team qualifications and availability (15%)
4. Proposed schedule and approach (10%)
5. Safety record (EMR) and OSHA compliance history (10%)

Whitmore Property Group reserves the right to reject any or all bids, to waive informalities, and to award the contract to the bidder whose proposal is deemed most advantageous to the project. The lowest bid will not necessarily be accepted.

ALTERNATES

Bidders shall provide pricing for the following alternates on the Bid Form:

Alternate #1 — Tankless Water Heater: Substitute the specified 75-gallon tank water heater with Rinnai CU199iN commercial tankless units (2 in parallel) with recirculation pump and buffer tank. Provide installed cost difference (add or deduct).

Alternate #2 — Point-of-Use Hot Water Recirculation: Add a dedicated recirculation loop with point-of-use hot water delivery at the bar area (3 stations). Include Grundfos COMFORT PM circulator pump and return line.

Alternate #3 — Floor Sink with Indirect Waste for Walk-In Cooler: Add one (1) 12"x12" floor sink with indirect waste connection at the walk-in cooler location, including 2" waste line routed to the nearest sanitary connection (approximately 25 LF).

ATTACHMENTS

- Attachment A: Bid Form (Excel)
- Attachment B: Architectural Floor Plan (Drawing A-101)
- Attachment C: MEP Coordination Plan (Drawing M-101)
- Attachment D: Plumbing Plan and Riser Diagrams (Drawings P-101, P-102, P-201)
- Attachment E: Site Plan with Grease Interceptor Location (Drawing C-101)
- Attachment F: Specifications — Division 22 Plumbing (Sections 220500 through 221500)
- Attachment G: Prevailing Wage Rate Schedule — Collin County 2026
- Attachment H: Geotechnical Report Summary (soil conditions at interceptor location)
- Attachment I: Sample Subcontract Agreement

Bid Date: May 22, 2026 | Start Date: June 2, 2026 | Completion: 8 weeks from NTP | LDs: $500/day
Requirements: TX Master Plumber license, 3+ years commercial experience, $1M GL / $2M umbrella insurance, prevailing wage, bonded`;

/* ── Main App ── */
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
  const paperRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom in right panel
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Auto-scroll paper card during bid typing
  useEffect(() => {
    if (typingFor === "bid" && paperRef.current) {
      paperRef.current.scrollTop = paperRef.current.scrollHeight;
    }
  }, [displayText, typingFor]);

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
    setTimeout(() => { setStep("analysis"); typeOut(PREBAKED_ANALYSIS, "analysis"); }, 1000);
  }

  function generateDemoBid() {
    setStep("bid");
    typeOut(PREBAKED_BID, "bid");
  }

  function handleFile(e: any) {
    const f = e.target.files?.[0];
    if (f) { const r = new FileReader(); r.onload = ev => { setRfpText(ev.target?.result as string); setStep("analysis"); setAnalysis("Analyzing your RFP... (API call in production)"); }; r.readAsText(f); }
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
    ? ["Lower the base bid by 5%", "Add the tankless water heater alternate", "Add more schedule detail", "Shorten the executive summary"]
    : ["What crew should we assign?", "How does pricing compare to Legacy West?", "What are the biggest risks?", "Can we do this in 6 weeks?"];

  const inSplit = step === "analysis" || step === "bid";

  return (
    <div style={{ fontFamily: theme.fontFamily, background: theme.bgPage, minHeight: "100vh", color: theme.textPrimary }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <div style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, height: 49 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={reset}>
          <span style={{ fontWeight: 700, fontSize: 17, color: theme.textPrimary, letterSpacing: "-0.02em" }}>Ironflow<span style={{ color: theme.blue }}> AI</span></span>
        </div>

        {/* Tab bar */}
        {inSplit && (
          <div style={{ display: "flex", gap: 0, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            {[
              { label: "Analysis", target: "analysis", enabled: true },
              { label: "Bid", target: "bid", enabled: !!analysis },
            ].map(tab => {
              const active = step === tab.target;
              return (
                <button
                  key={tab.target}
                  onClick={() => {
                    if (!tab.enabled) return;
                    if (tab.target === "bid" && !bidDoc && !typing) generateDemoBid();
                    else setStep(tab.target);
                  }}
                  style={{
                    padding: "0 16px",
                    height: 49,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: tab.enabled ? "pointer" : "default",
                    background: "none",
                    border: "none",
                    borderBottom: active ? `2px solid ${theme.blue}` : "2px solid transparent",
                    color: active ? theme.blue : tab.enabled ? theme.textSecondary : theme.textTertiary,
                    transition: theme.transitionFast,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Right actions */}
        <div>
          {step !== "upload" && <button onClick={reset} style={{ padding: "6px 14px", borderRadius: theme.radiusPill, border: `1px solid ${theme.border}`, background: theme.bgCard, color: theme.textSecondary, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: theme.transitionFast }}>New RFP</button>}
        </div>
      </div>

      {/* ── Upload page ── */}
      {step === "upload" && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: theme.radiusXl, background: theme.blueLight, display: "flex", alignItems: "center", justifyContent: "center", color: theme.blue, fontWeight: 700, fontSize: 26, margin: "0 auto 24px" }}>IF</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.03em" }}>Upload an RFP</h1>
          <p style={{ fontSize: 17, color: theme.textSecondary, margin: "0 0 40px", lineHeight: 1.5 }}>We'll check if you can do the job, then<br/>draft your complete bid response.</p>
          <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${theme.border}`, borderRadius: theme.radiusXl, padding: "56px 40px", cursor: "pointer", transition: `all ${theme.transition}`, marginBottom: 20, background: theme.bgCard, boxShadow: theme.shadowSm }}
            onMouseOver={e => { e.currentTarget.style.borderColor = theme.blue; e.currentTarget.style.background = theme.blueLight; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgCard; }}>
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
            Try demo — Restaurant Build-Out at The Warren, Frisco
          </button>
        </div>
      )}

      {/* ── Analyzing ── */}
      {step === "analyzing" && (
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "120px 20px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: theme.blue, animation: `pulse-ring 1.4s ease-in-out ${i*0.2}s infinite` }} />)}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Reading the RFP...</h2>
          <p style={{ fontSize: 13, color: theme.textSecondary }}>Checking against your projects, certs, and crew</p>
        </div>
      )}

      {/* ── Split Panel Layout (analysis + bid) ── */}
      {inSplit && (
        <div style={{ display: "flex", height: "calc(100vh - 49px)", overflow: "hidden" }}>

          {/* ── Left Panel: Document Viewer ── */}
          <div style={{ flex: "0 0 55%", display: "flex", flexDirection: "column", overflow: "hidden", background: theme.bgDesk, padding: "32px 40px" }}>
            <div ref={paperRef} style={{ flex: 1, background: theme.bgCard, borderRadius: 4, boxShadow: theme.shadowPaper, padding: "48px 56px", overflow: "auto", lineHeight: 1.8 }}>
              {step === "analysis" && <RenderRFPDocument text={rfpText} />}
              {step === "bid" && (
                <>
                  {/* Bid doc header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Your Bid Response</h2>
                    <div style={{ display: "flex", gap: 6 }}>
                      {bidDoc && <span style={{ fontSize: 11, color: theme.statusGreenText, background: theme.statusGreenBg, padding: "4px 12px", borderRadius: theme.radiusPill, fontWeight: 600 }}>Complete</span>}
                      {bidDoc && <button onClick={() => navigator.clipboard.writeText(bidDoc)} style={{ fontSize: 11, color: theme.textSecondary, background: theme.divider, padding: "4px 12px", borderRadius: theme.radiusPill, border: "none", cursor: "pointer" }}>Copy</button>}
                      {typing && typingFor === "bid" && <span style={{ fontSize: 11, color: theme.blue, background: theme.blueLight, padding: "4px 12px", borderRadius: theme.radiusPill, fontWeight: 600 }}>Generating...</span>}
                    </div>
                  </div>
                  <RenderMD text={showBid} />
                  {typing && typingFor === "bid" && <span style={{ display: "inline-block", width: 2, height: 16, background: theme.blue, animation: "blink 0.8s infinite" }} />}
                </>
              )}
            </div>
          </div>

          {/* ── Right Panel: Analysis / Chat ── */}
          <div style={{ flex: "0 0 45%", display: "flex", flexDirection: "column", overflow: "hidden", borderLeft: `1px solid ${theme.borderLight}`, background: theme.bgPage }}>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px" }}>

              {/* Analysis content */}
              {step === "analysis" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>RFP Analysis</h2>
                    <span style={{ fontSize: 11, color: theme.blue, background: theme.blueLight, padding: "4px 12px", borderRadius: theme.radiusPill, fontWeight: 600 }}>Step 1</span>
                  </div>
                  <RenderAnalysis text={showAnalysis} />
                  {typing && typingFor === "analysis" && <span style={{ display: "inline-block", width: 2, height: 16, background: theme.blue, animation: "blink 0.8s infinite" }} />}
                </>
              )}

              {/* Bid summary metrics */}
              {step === "bid" && <RenderBidSummary />}

              {/* Suggestions */}
              {(analysis || bidDoc) && !typing && (
                <div style={{ marginTop: 20, marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{bidDoc ? "Refine your bid" : "Ask about this RFP"}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {suggestions.map((q, i) => (
                      <button key={i} onClick={() => askFollowUp(q)} style={{ padding: "10px 14px", borderRadius: theme.radiusMd, border: `1px solid ${theme.borderLight}`, background: theme.bgCard, fontSize: 12, color: theme.textPrimary, textAlign: "left", cursor: "pointer", lineHeight: 1.4, transition: `all ${theme.transition}`, boxShadow: theme.shadowSm }}
                        onMouseOver={e => e.currentTarget.style.borderColor = theme.blue} onMouseOut={e => e.currentTarget.style.borderColor = theme.borderLight}>{q}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 14, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "user"
                    ? <div style={{ maxWidth: "85%", background: theme.blue, color: "#fff", padding: "10px 16px", borderRadius: "16px 16px 4px 16px", fontSize: 13, lineHeight: 1.6 }}>{msg.text}</div>
                    : <div style={{ maxWidth: "95%", background: theme.divider, borderRadius: "4px 16px 16px 16px", padding: "14px 18px", fontSize: 13, lineHeight: 1.7, color: theme.textPrimary, whiteSpace: "pre-wrap" }}>{msg.text}</div>
                  }
                </div>
              ))}
              {loading && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0" }}>{[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: theme.blue, animation: `pulse-ring 1.4s ease-in-out ${i*0.2}s infinite` }} />)}<span style={{ fontSize: 12, color: theme.textSecondary }}>Thinking...</span></div>}
              <div ref={endRef} />
            </div>

            {/* ── Bottom bar ── */}
            <div style={{ borderTop: `1px solid ${theme.borderLight}`, padding: "12px 20px", background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)" }}>
              {/* Generate bid button */}
              {step === "analysis" && analysis && !bidDoc && !typing && (
                <button onClick={generateDemoBid} style={{ width: "100%", padding: "14px", borderRadius: theme.radiusMd, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", background: theme.blue, color: "#fff", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,113,227,0.3)", transition: `all ${theme.transition}`, letterSpacing: "-0.01em" }}>
                  Generate Full Bid Response
                </button>
              )}
              {/* Chat input */}
              <div style={{ display: "flex", gap: 8 }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") askFollowUp(input); }}
                  placeholder={bidDoc ? "Ask to change pricing, rewrite a section..." : "Ask anything about this RFP..."}
                  style={{ flex: 1, padding: "10px 16px", borderRadius: theme.radiusPill, border: `1px solid ${theme.borderLight}`, background: theme.bgCard, fontSize: 13, outline: "none", color: theme.textPrimary, boxShadow: theme.shadowInput, transition: `border-color ${theme.transition}, box-shadow ${theme.transition}` }}
                  onFocus={e => { e.target.style.borderColor = theme.blue; e.target.style.boxShadow = "0 0 0 3px rgba(0,113,227,0.15)"; }} onBlur={e => { e.target.style.borderColor = theme.borderLight; e.target.style.boxShadow = theme.shadowInput; }} />
                <button onClick={() => askFollowUp(input)} disabled={!input.trim() || loading} style={{ padding: "10px 18px", borderRadius: theme.radiusPill, border: "none", fontWeight: 600, fontSize: 13, background: input.trim() ? theme.blue : theme.borderLight, color: input.trim() ? "#fff" : theme.textTertiary, cursor: input.trim() ? "pointer" : "default", transition: `all ${theme.transition}` }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
