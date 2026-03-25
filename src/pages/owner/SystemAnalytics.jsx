import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { FiTrendingUp, FiActivity, FiGlobe, FiUsers, FiShield, FiCpu, FiLayers, FiTrendingDown, FiMinus } from "react-icons/fi";
import "./OwnerAddOns.css";

import { useState, useEffect, useCallback } from "react";
import { getOwnerStats, getSalesForecast, getOwnerBranchTrend } from "../../services/dashboardService";

const SystemAnalytics = () => {
  const [showForecast, setShowForecast] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const franchiseId = user?.franchise_id;

  const fetchData = useCallback(() => {
    if (!franchiseId) return;
    setLoading(true);
    Promise.all([
      getOwnerStats(franchiseId),
      getSalesForecast(franchiseId),
    ]).then(([s, f]) => {
      setStats(s.data);
      setForecast(f.data);
      setLoading(false);
    }).catch(err => {
      console.error("Analytics error:", err);
      setLoading(false);
    });
  }, [franchiseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Merge historical + forecast into a single chart series
  const chartData = [
    ...(forecast?.historicalPoints || []).map(p => ({
      date: p.date,
      revenue: p.revenue,
      forecast: null,
    })),
    ...(showForecast && forecast?.forecastPoints
      ? forecast.forecastPoints.map(p => ({
          date: p.date,
          revenue: null,
          forecast: p.forecast,
        }))
      : []),
  ];

  // Trend badge
  const trendIcon = forecast?.trend === "GROWING"
    ? <FiTrendingUp />
    : forecast?.trend === "DECLINING"
      ? <FiTrendingDown />
      : <FiMinus />;
  const trendColor = forecast?.trend === "GROWING" ? "#10b981"
    : forecast?.trend === "DECLINING" ? "#ef4444" : "#f59e0b";

  const kpis = [
    { label: "Total Revenue",    value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: "#10b981", icon: <FiTrendingUp /> },
    { label: "Total Branches",   value: stats?.totalBranches || 0,                         color: "#3b82f6", icon: <FiGlobe /> },
    { label: "Active Nodes",     value: stats?.activeBranches || 0,                        color: "#f59e0b", icon: <FiActivity /> },
    { label: "Total Workforce",  value: stats?.totalEmployees || 0,                        color: "#a855f7", icon: <FiUsers /> },
    { label: "System Efficiency",value: `${stats?.efficiencyScore || 0}%`,                 color: "#22d3ee", icon: <FiShield /> },
  ];

  return (
    <div className="addon-page" style={{ padding: "40px 20px" }}>
      <div className="addon-header" style={{ marginBottom: "40px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "20px" }}>
        <div>
          <h1 style={{ background: "linear-gradient(90deg, #f8fafc 0%, #cbd5e1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "flex", alignItems: "center", gap: "12px", fontSize: "28px" }}>
            <FiLayers color="#3b82f6" /> System Analytics Matrix
          </h1>
          <p className="addon-subtitle" style={{ fontSize: "15px", color: "#94a3b8", marginTop: "8px" }}>Enterprise-wide business intelligence utilizing distributed machine learning nodes.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "100px 0", textAlign: "center", color: "#64748b" }}>
           <div className="spinner" style={{ border: "3px solid rgba(255,255,255,0.05)", borderTop: "3px solid #3b82f6", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "0 auto 20px" }}></div>
           <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
           Compiling neural dashboard...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* Top KPI Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            {kpis.map(k => (
              <div key={k.label} className="glass-card" style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.03)", padding: "24px", borderRadius: "16px", position: "relative", overflow: "hidden", transition: "transform 0.2s" }} onMouseOver={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseOut={e=>e.currentTarget.style.transform="translateY(0)"}>
                <div style={{ position: "absolute", right: "-10px", top: "-10px", opacity: 0.05, transform: "scale(2)", color: k.color }}>{k.icon}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div style={{ color: k.color, padding: "8px", background: `${k.color}15`, borderRadius: "8px", display: "flex" }}>{k.icon}</div>
                  <p style={{ margin: 0, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: "700" }}>{k.label}</p>
                </div>
                <strong style={{ color: "#f8fafc", fontSize: "28px", letterSpacing: "-1px", fontWeight: "800" }}>{k.value}</strong>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="glass-card" style={{ padding: "32px", background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#f8fafc", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FiTrendingUp color="#10b981"/> Network Growth Trajectory
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>90-day historical revenue • Weighted ML projection</p>
                  {forecast?.trend && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: `${trendColor}15`, border: `1px solid ${trendColor}33`, color: trendColor, padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: "700" }}>
                      {trendIcon} {forecast.trend} {forecast.trendPct > 0 ? "+" : ""}{forecast.trendPct}%
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowForecast(!showForecast)}
                style={{
                  background: showForecast ? "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)" : "rgba(30, 41, 59, 0.8)",
                  border: showForecast ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: showForecast ? "white" : "#e2e8f0",
                  padding: "12px 24px", borderRadius: "12px", fontWeight: "700", fontSize: "14px",
                  display: "flex", alignItems: "center", gap: "10px",
                  boxShadow: showForecast ? "0 8px 20px rgba(168, 85, 247, 0.4)" : "none",
                  transition: "all 0.3s", cursor: "pointer", outline: "none"
                }}
              >
                <FiCpu size={18} className={showForecast ? "spinning-cpu" : ""} />
                {showForecast ? "Neural Forecast: Active" : "Engage AI Predictor"}
              </button>
            </div>

            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={15}
                  interval={Math.floor(chartData.length / 8)} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value, name) => value != null ? [`₹${Number(value).toLocaleString("en-IN")}`, name] : [null, name]}
                  contentStyle={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", padding: "16px" }}
                  itemStyle={{ color: "#f8fafc", fontWeight: "700", paddingTop: "8px" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", marginBottom: "8px" }}
                />
                <Area type="monotone" dataKey="revenue" name="Actual Revenue" stroke="#3b82f6" fill="url(#colorRevenue)" strokeWidth={2.5} connectNulls={false} dot={false} />
                {showForecast && (
                  <Area type="monotone" dataKey="forecast" name="AI Projection" stroke="#a855f7" fill="url(#colorForecast)" strokeWidth={2.5} strokeDasharray="8 5" connectNulls={false} dot={false} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ML Insights */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "32px", marginTop: "10px" }}>
            <div className="glass-card" style={{ padding: "32px", backgroundColor: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "16px", borderRadius: "16px", color: "#10b981" }}><FiTrendingUp size={32} /></div>
                <div>
                  <h4 style={{ margin: "0 0 6px 0", color: "#94a3b8", textTransform: "uppercase", fontSize: "13px", letterSpacing: "1px", fontWeight: "700" }}>30-Day Revenue Projection</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Weighted Linear Regression (EWMA-smoothed)</p>
                </div>
              </div>
              <div style={{ fontSize: "42px", fontWeight: "800", color: "#10b981", letterSpacing: "-1px" }}>
                {forecast?.predictedTotal30Days ? `₹${(forecast.predictedTotal30Days).toLocaleString("en-IN")}` : "Processing..."}
              </div>
              {forecast?.weeklyAvg != null && (
                <p style={{ marginTop: "12px", color: "#64748b", fontSize: "13px" }}>
                  Current 7-day avg revenue: <span style={{ color: "#94a3b8", fontWeight: "600" }}>₹{forecast.weeklyAvg.toLocaleString("en-IN")}/day</span>
                </p>
              )}
            </div>

            <div className="glass-card" style={{ padding: "32px", backgroundColor: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ background: forecast?.confidenceScore > 60 ? "rgba(59, 130, 246, 0.1)" : "rgba(245, 158, 11, 0.1)", padding: "16px", borderRadius: "16px", color: forecast?.confidenceScore > 60 ? "#3b82f6" : "#f59e0b" }}><FiActivity size={32} /></div>
                <div>
                  <h4 style={{ margin: "0 0 6px 0", color: "#94a3b8", textTransform: "uppercase", fontSize: "13px", letterSpacing: "1px", fontWeight: "700" }}>R² Confidence Score</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Algorithm Reliability Index</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "16px" }}>
                <div style={{ fontSize: "42px", fontWeight: "800", color: forecast?.confidenceScore > 60 ? "#3b82f6" : "#f59e0b", letterSpacing: "-1px" }}>
                  {forecast?.confidenceScore !== undefined ? `${forecast.confidenceScore}%` : "0%"}
                </div>
                <div style={{ paddingBottom: "8px", fontWeight: "600", color: "#94a3b8" }}>
                  MODEL: {forecast?.confidenceScore > 60 ? <span style={{color:"#3b82f6"}}>OPTIMAL</span> : <span style={{color:"#f59e0b"}}>CALIBRATING</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .spinning-cpu { animation: spinCpu 3s linear infinite; }
        @keyframes spinCpu { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SystemAnalytics;
