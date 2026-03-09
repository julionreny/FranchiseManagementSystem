import { useState } from "react";
import "./OwnerAddOns.css";

const reports = [
  {
    id: "REP-2026-001",
    title: "Q1 Financial Growth Analysis",
    type: "Financial",
    date: "2026-03-05",
    status: "Published",
    summary: "Comprehensive breakdown of revenue growth across all franchise locations for the first quarter of 2026. Highlights include a 15% increase in operational efficiency.",
    tags: ["revenue", "growth", "q1-2026"]
  },
  {
    id: "REP-2026-002",
    title: "Compliance Audit - South Region",
    type: "Compliance",
    date: "2026-03-01",
    status: "Published",
    summary: "Standard regulatory compliance audit for branches in the southern region. All locations met the minimum health and safety requirements.",
    tags: ["compliance", "audit", "safety"]
  },
  {
    id: "REP-2026-003",
    title: "Quarterly HR Engagement Survey",
    type: "HR",
    date: "2026-02-25",
    status: "Draft",
    summary: "Internal survey results tracking employee satisfaction and turnover rates. Preliminary data suggests high retention in technical roles.",
    tags: ["hr", "engagement", "employees"]
  },
  {
    id: "REP-2026-004",
    title: "Supply Chain Optimization Report",
    type: "Operations",
    date: "2026-02-18",
    status: "Published",
    summary: "Analysis of inventory management and logistics costs. Recommendations for vendor consolidation could lead to 5% savings.",
    tags: ["operations", "logistics", "savings"]
  }
];

const TYPES = ["All", "Financial", "Compliance", "HR", "Operations", "Marketing"];

const statusColor = {
  Published: { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
  Draft: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
};

const typeColor = {
  Financial: "#3b82f6", Compliance: "#a855f7", HR: "#10b981",
  Operations: "#f59e0b", Marketing: "#ef4444",
};

const HQReports = () => {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const displayed = filter === "All" ? reports : reports.filter(r => r.type === filter);

  return (
    <div className="addon-page">
      <div className="addon-header">
        <h1>📋 HQ Reports</h1>
        <div className="addon-filter-row">
          {TYPES.map(t => (
            <button key={t} className={`filter-chip ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="reports-list">
        {displayed.map(r => (
          <div key={r.id} className="report-card" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
            <div className="report-card-header">
              <div>
                <span className="report-type-badge" style={{ background: typeColor[r.type] + "22", color: typeColor[r.type] }}>{r.type}</span>
                <h3>{r.title}</h3>
                <p className="report-meta">{r.id} &nbsp;·&nbsp; {r.date}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                <span className="status-badge" style={{ background: statusColor[r.status].bg, color: statusColor[r.status].color }}>{r.status}</span>
                <button className="expand-btn">{expanded === r.id ? "▲ Collapse" : "▼ View"}</button>
              </div>
            </div>

            {expanded === r.id && (
              <div className="report-body">
                <p>{r.summary}</p>
                <div className="tag-row">
                  {r.tags.map(t => <span key={t} className="tag">#{t}</span>)}
                </div>
                <button className="download-btn">⬇ Download PDF</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HQReports;
