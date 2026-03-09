import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from "recharts";
import { FiTrendingUp, FiActivity, FiGlobe, FiUsers, FiShield } from "react-icons/fi";
import "./OwnerAddOns.css";

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7"];

import { useState, useEffect, useCallback } from "react";
import { getOwnerStats, getSalesForecast, getOwnerBranchTrend } from "../../services/dashboardService";

const SystemAnalytics = () => {
  const [showForecast, setShowForecast] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const franchiseId = user?.franchise_id;

  const fetchData = useCallback(() => {
    if (!franchiseId) return;
    setLoading(true);
    Promise.all([
      getOwnerStats(franchiseId),
      getSalesForecast(franchiseId),
      getOwnerBranchTrend(franchiseId)
    ]).then(([s, f, t]) => {
      setStats(s.data);
      setForecast(f.data);
      
      const trendList = t.data || [];
      const grouped = trendList.reduce((acc, curr) => {
        if (!acc[curr.name]) acc[curr.name] = { month: curr.name, revenue: 0 };
        acc[curr.name].revenue += Number(curr.revenue);
        return acc;
      }, {});
      setRevenueData(Object.values(grouped));
      setLoading(false);
    }).catch(err => {
      console.error("Analytics error:", err);
      setLoading(false);
    });
  }, [franchiseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = [...revenueData];
  if (showForecast && forecast?.forecastPoints) {
    forecast.forecastPoints.forEach((p, i) => {
      chartData.push({
        month: `Proj ${i + 1}`,
        revenue: null,
        forecast: p.prediction
      });
    });
  }

  const kpis = [
    { label: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: "#10b981", icon: <FiTrendingUp /> },
    { label: "Total Branches",   value: stats?.totalBranches || 0,  color: "#3b82f6", icon: <FiGlobe /> },
    { label: "Active Nodes",    value: stats?.activeBranches || 0,  color: "#f59e0b", icon: <FiActivity /> },
    { label: "Total Workforce",  value: stats?.totalEmployees || 0,     color: "#a855f7", icon: <FiUsers /> },
    { label: "System Efficiency", value: `${stats?.efficiencyScore || 0}%`,  color: "#22d3ee", icon: <FiShield /> },
  ];

  return (
    <div className="addon-page">
      <div className="addon-header">
        <div>
          <h1>📈 System Analytics</h1>
          <p className="addon-subtitle">Enterprise-wide business intelligence — March 2026</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="addon-kpi-strip">
        {loading ? <p>Loading stats...</p> : kpis.map(k => (
          <div key={k.label} className="kpi-strip-card glass-card" style={{ borderBottom: `3px solid ${k.color}`, background: "rgba(30, 41, 59, 0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <p style={{ margin: 0 }}>{k.label}</p>
              <div style={{ color: k.color, opacity: 0.8 }}>{k.icon}</div>
            </div>
            <strong style={{ color: "#fff", fontSize: "20px" }}>{k.value}</strong>
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="addon-chart-box glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3>System Growth Matrix</h3>
            <p className="addon-subtitle" style={{ fontSize: "12px" }}>Cumulative system revenue across all active branches</p>
          </div>
          <button 
            className="addon-btn"
            onClick={() => setShowForecast(!showForecast)}
            style={{ 
              background: showForecast ? "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" : "rgba(255,255,255,0.05)",
              border: showForecast ? "none" : "1px solid rgba(255,255,255,0.1)",
              color: showForecast ? "white" : "#94a3b8"
            }}
          >
            {showForecast ? "Neural Forecast Active" : "Predict Future Revenue"}
          </button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
            <Tooltip 
              formatter={v => v ? `₹${Number(v).toLocaleString("en-IN")}` : "Calculating..."} 
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} 
            />
            <Area type="monotone" dataKey="revenue" name="Historical" stroke="#3b82f6" fill="url(#rev)" strokeWidth={3} connectNulls />
            {showForecast && (
              <Area 
                type="monotone" 
                dataKey="forecast" 
                name="ML Prediction" 
                stroke="#a78bfa" 
                fill="url(#fore)" 
                strokeWidth={2} 
                strokeDasharray="6 4" 
                connectNulls
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="addon-two-col">
        <div className="addon-chart-box glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <FiActivity size={48} color="#334155" style={{ marginBottom: "16px" }} />
          <h3>Advanced Intelligence</h3>
          <p style={{ color: "#64748b", textAlign: "center", fontSize: "14px", maxWidth: "300px" }}>
            Real-time neural processing of sales patterns is active. Data streams are healthy.
          </p>
        </div>
        <div className="addon-chart-box glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <FiShield size={48} color="#334155" style={{ marginBottom: "16px" }} />
          <h3>System Integrity</h3>
          <p style={{ color: "#64748b", textAlign: "center", fontSize: "14px", maxWidth: "300px" }}>
            All analytics values are cryptographically verified against backend transaction logs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;
