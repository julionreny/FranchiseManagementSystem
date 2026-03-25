import { useState, useEffect } from "react";
import { getHQReports, generateAutomatedReport } from "../../services/reportService";
import { getBranchesByFranchise } from "../../services/branchService";
import { FiCommand, FiFileText, FiDownload, FiChevronDown, FiChevronUp, FiX, FiActivity, FiCpu, FiTrendingUp } from "react-icons/fi";
import { jsPDF } from "jspdf";
import "./OwnerAddOns.css"; 

const TYPES = ["All", "Financial", "Operations", "Marketing"];
const REPORT_TYPES = ["Financial", "Operations", "Marketing"];

const statusColor = {
  Published: { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.2)" },
  Draft: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.2)" },
};

const typeColor = {
  Financial: "#3b82f6", Operations: "#f59e0b", Marketing: "#a855f7",
};

const HQReports = () => {
  const [reports, setReports] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  
  // Auto-Gen Modal State
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({ 
    branchId: "ALL", 
    timelineDays: "30", 
    type: "Financial"
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const franchiseId = user?.franchise_id;

  useEffect(() => {
    if (!franchiseId) return;
    fetchData();
  }, [franchiseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [repRes, brRes] = await Promise.all([
        getHQReports(franchiseId),
        getBranchesByFranchise(franchiseId)
      ]);
      setReports(repRes.data);
      setBranches(brRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!franchiseId) return;
    
    setGenerating(true);
    try {
      await generateAutomatedReport({
        franchiseId,
        branchId: formData.branchId,
        timelineDays: formData.timelineDays,
        title: `Automated ${formData.type} Report`,
        type: formData.type
      });
      
      setShowModal(false);
      setFormData({ branchId: "ALL", timelineDays: "30", type: "Financial" });
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = (e, report) => {
    e.stopPropagation();
    
    // Create new jsPDF instance (standard A4)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Theme Colors
    const primaryColor = [15, 23, 42]; // Slate 900
    const accentColor = report.type === "Financial" ? [59, 130, 246] : report.type === "Operations" ? [245, 158, 11] : [168, 85, 247];
    const textColor = [51, 65, 85]; // Slate 700
    const lightText = [100, 116, 139]; // Slate 500

    // Header Background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, "F");

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("EXECUTIVE REPORT", 105, 20, { align: "center" });

    // Subtitle / System Name
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("FRANCHISE MANAGEMENT SYSTEM", 105, 28, { align: "center" });

    // Date & Meta Info Box
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.roundedRect(15, 50, 180, 30, 3, 3, "FD");

    // Meta Text
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`ID: ${report.report_id}`, 20, 60);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...lightText);
    const dateStr = new Date(report.created_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });
    doc.text(`Generated: ${dateStr}`, 20, 68);
    
    // Category & Status Badge (Textual)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accentColor);
    doc.text(`CATEGORY: ${report.type.toUpperCase()}`, 130, 60);

    const statusCol = report.status === "Published" ? [16, 185, 129] : [245, 158, 11];
    doc.setTextColor(...statusCol);
    doc.text(`STATUS: ${report.status.toUpperCase()}`, 130, 68);

    // Report Title
    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    
    // Title might be long, so split it
    const titleLines = doc.splitTextToSize(report.title, 180);
    doc.text(titleLines, 15, 95);
    
    let currentY = 95 + (titleLines.length * 7);

    // Divider
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.5);
    doc.line(15, currentY + 2, 195, currentY + 2);

    currentY += 12;

    // Summary Content (Auto-wrapped)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    
    const summaryLines = doc.splitTextToSize(report.summary, 180);
    
    // Handle Page Breaks for summary
    for (let i = 0; i < summaryLines.length; i++) {
        if (currentY > 270) {
            doc.addPage();
            currentY = 20;
        }
        doc.text(summaryLines[i], 15, currentY);
        currentY += 6;
    }

    currentY += 10;

    // Tags
    if (report.tags && report.tags.length > 0) {
        if (currentY > 260) {
            doc.addPage();
            currentY = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text("TAGS:", 15, currentY);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...lightText);
        doc.text(report.tags.join(" • "), 30, currentY);
        currentY += 10;
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...lightText);
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
        doc.text("Confidential & Proprietary • Do not distribute without authorization", 105, 290, { align: "center" });
    }

    // Save
    doc.save(`${report.report_id}_HQ_Report.pdf`);
  };

  const displayed = filter === "All" ? reports : reports.filter(r => r.type === filter);

  return (
    <div className="addon-page">
      <div className="addon-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ background: "linear-gradient(90deg, #f8fafc 0%, #cbd5e1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "flex", alignItems: "center", gap: "12px" }}>
            <FiCpu size={32} color="#3b82f6" /> HQ Reporting Engine
          </h1>
          <p className="addon-subtitle" style={{ fontSize: "14px", marginTop: "8px" }}>Automated, data-driven operational intelligence</p>
        </div>
        <button className="addon-btn" onClick={() => setShowModal(true)} style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", display: "flex", alignItems: "center", gap: "10px", border: "none", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)", padding: "12px 24px", fontSize: "15px" }}>
          <FiCommand size={18} /> Run Auto-Generator
        </button>
      </div>

      <div className="addon-filter-row" style={{ marginTop: "30px", marginBottom: "30px", overflowX: "auto", display: "flex", gap: "10px" }}>
        {TYPES.map(t => (
          <button key={t} className={`filter-chip ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)} style={{ flexShrink: 0, padding: "8px 20px", borderRadius: "100px", border: filter === t ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)", background: filter === t ? "rgba(59,130,246,0.1)" : "transparent", color: filter === t ? "#60a5fa" : "#94a3b8", cursor: "pointer", transition: "all 0.2s" }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "100px", color: "#94a3b8" }}>
          <div className="spinner" style={{ border: "3px solid rgba(255,255,255,0.05)", borderTop: "3px solid #3b82f6", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "0 auto 20px" }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          Querying data clusters...
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8", background: "rgba(30,41,59,0.3)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "30px", borderRadius: "50%", marginBottom: "20px" }}>
            <FiFileText size={64} style={{ opacity: 0.2, color: "#3b82f6" }} />
          </div>
          <h3 style={{ color: "#f8fafc", margin: "0 0 10px 0", fontSize: "22px" }}>No Data Compiled</h3>
          <p style={{ fontSize: "15px", maxWidth: "400px", lineHeight: "1.6" }}>The reporting engine has not generated any documents matching this criteria. Run the auto-generator to compile live metrics.</p>
        </div>
      ) : (
        <div className="reports-list" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {displayed.map(r => {
            const d = new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute:"2-digit" });
            const sColor = statusColor[r.status] || statusColor.Draft;
            const tColor = typeColor[r.type] || "#ffffff";
            
            return (
              <div key={r.report_id} className={`report-card glass-card ${expanded === r.report_id ? 'expanded' : ''}`} style={{ cursor: "pointer", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", padding: "30px", position: "relative", overflow: "hidden", background: expanded === r.report_id ? "rgba(30,41,59,0.8)" : "rgba(30,41,59,0.4)", border: expanded === r.report_id ? `1px solid ${tColor}55` : "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }} onClick={() => setExpanded(expanded === r.report_id ? null : r.report_id)}>
                
                <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: tColor, opacity: expanded === r.report_id ? 1 : 0.3, transition: "opacity 0.3s" }} />

                <div className="report-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                  <div style={{ flex: "1 1 auto", minWidth: "250px", paddingLeft: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <span className="report-type-badge" style={{ background: tColor + "15", color: tColor, padding: "6px 14px", borderRadius: "100px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", border: `1px solid ${tColor}33` }}>{r.type}</span>
                      <span className="status-badge" style={{ background: sColor.bg, color: sColor.color, padding: "6px 14px", borderRadius: "100px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", border: `1px solid ${sColor.border}` }}>{r.status}</span>
                    </div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#f8fafc", fontWeight: "600", letterSpacing: "-0.5px" }}>{r.title}</h3>
                    <p className="report-meta" style={{ margin: 0, fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: "monospace", color: "#94a3b8", background: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: "4px" }}>{r.report_id}</span> • <span>Generated: {d}</span>
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                    <div style={{ color: expanded === r.report_id ? "#f8fafc" : "#64748b", display: "flex", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "10px 16px", borderRadius: "100px", fontSize: "13px", gap: "8px", fontWeight: "600", transition: "all 0.2s" }}>
                      {expanded === r.report_id ? <><FiChevronUp size={18}/> CLOSE DOCUMENT</> : <><FiChevronDown size={18}/> EXPAND DOCUMENT</>}
                    </div>
                  </div>
                </div>

                {expanded === r.report_id && (
                  <div className="report-body" style={{ marginTop: "30px", paddingTop: "30px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingLeft: "10px" }}>
                    <h4 style={{ margin: "0 0 16px 0", color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <FiActivity color={tColor} /> Automated Executive Summary
                    </h4>
                    <p style={{ color: "#e2e8f0", lineHeight: "1.8", whiteSpace: "pre-line", marginBottom: "30px", fontSize: "15px", background: "rgba(0,0,0,0.2)", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>{r.summary}</p>
                    
                    <div className="tag-row" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "30px" }}>
                      {r.tags && r.tags.map(t => <span key={t} className="tag" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t}</span>)}
                    </div>
                    
                    <button className="addon-btn print-hide" style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#60a5fa", display: "flex", alignItems: "center", gap: "10px", padding: "12px 24px", borderRadius: "8px", fontWeight: "600", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)"} onMouseOut={e => e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)"} onClick={(e) => handleExport(e, r)}>
                      <FiDownload size={18} /> Download Protected PDF
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AUTO-GEN REPORT MODAL */}
      {showModal && (
        <div className="modal-overlay" style={{ animation: "fadeIn 0.2s ease-out", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div className="modal-content glass-card" style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)", width: "90%", maxWidth: "550px", padding: "40px", background: "rgba(30, 41, 59, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.02) inset" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
              <div>
                <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", color: "#f8fafc", display: "flex", alignItems: "center", gap: "10px" }}><FiCpu color="#10b981"/> Report Generator</h2>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>Configure parameters for database aggregation</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#94a3b8", cursor: "pointer", padding: "8px", display: "flex", borderRadius: "50%", transition: "all 0.2s" }} onMouseOver={e => {e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color="white";}} onMouseOut={e => {e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color="#94a3b8";}}><FiX size={20}/></button>
            </div>

            <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" }}><FiActivity /> Data Scope (Branch)</label>
                <select value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} style={{ width: "100%", padding: "16px", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "15px", appearance: "none", outline: "none", cursor: "pointer" }}>
                  <option value="ALL" style={{background: "#1e293b"}}>Overall Franchise (All Branches)</option>
                  {branches.map(b => (
                    <option key={b.branch_id} value={b.branch_id} style={{background: "#1e293b"}}>Branch: {b.branch_name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" }}><FiTrendingUp /> Evaluation Timeline</label>
                  <select value={formData.timelineDays} onChange={e => setFormData({...formData, timelineDays: e.target.value})} style={{ width: "100%", padding: "16px", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "15px", outline: "none", cursor: "pointer" }}>
                    <option value="7" style={{background: "#1e293b"}}>Last 7 Days (Weekly)</option>
                    <option value="30" style={{background: "#1e293b"}}>Last 30 Days (Monthly)</option>
                    <option value="90" style={{background: "#1e293b"}}>Last 90 Days (Quarterly)</option>
                    <option value="365" style={{background: "#1e293b"}}>Last 365 Days (Annual)</option>
                  </select>
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" }}><FiFileText /> Report Category</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: "100%", padding: "16px", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "15px", outline: "none", cursor: "pointer" }}>
                    {REPORT_TYPES.map(t => <option key={t} value={t} style={{background: "#1e293b"}}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "16px", display: "flex", gap: "16px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "16px 24px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", borderRadius: "12px", fontWeight: "600", cursor: "pointer", fontSize: "15px", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Cancel</button>
                <button type="submit" disabled={generating} style={{ padding: "16px 32px", background: generating ? "#94a3b8" : "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: generating ? "not-allowed" : "pointer", fontSize: "15px", boxShadow: generating ? "none" : "0 8px 20px rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s" }}>
                  {generating ? <FiCommand className="spinning-icon" size={20}/> : <FiCommand size={20}/>} 
                  {generating ? "Compiling..." : "Execute Query & Compile"}
                </button>
              </div>
            </form>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(12px); } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes spin { 100% { transform: rotate(360deg); } }
            .spinning-icon { animation: spin 1s linear infinite; }
            @media print {
              body * { visibility: hidden; }
              .expanded, .expanded * { visibility: visible !important; }
              .expanded { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; border: none !important; box-shadow: none !important; background: white !important; color: black !important; padding: 0 !important; }
              .expanded .report-body { color: black !important; background: transparent !important; border: none !important; }
              .expanded p { color: black !important; }
              .expanded h3, .expanded h4 { color: black !important; }
              .print-hide, .addon-btn, .modal-overlay, .addon-header, .addon-filter-row { display: none !important; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default HQReports;
