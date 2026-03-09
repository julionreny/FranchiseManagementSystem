import { useEffect, useState, useCallback } from "react";
import { getOwnerBranchPerformance, getOwnerBranchTrend } from "../../services/dashboardService";
import {
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, Bar, LineChart, Line, AreaChart, Area
} from "recharts";
import { FiBarChart2, FiTrendingUp, FiCreditCard, FiUsers, FiMapPin } from "react-icons/fi";
import "./OwnerAddOns.css";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];

const BranchPerformance = () => {
  const [selected, setSelected] = useState("All");
  const [branchData, setBranchData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const franchiseId = user?.franchise_id;

  const fetchData = useCallback(() => {
    if (!franchiseId) return;
    setLoading(true);
    Promise.all([
      getOwnerBranchPerformance(franchiseId),
      getOwnerBranchTrend(franchiseId)
    ]).then(([perf, trend]) => {
      setBranchData(perf.data || []);
      
      const trendList = trend.data || [];
      const grouped = trendList.reduce((acc, curr) => {
        if (!acc[curr.name]) acc[curr.name] = { month: curr.name };
        acc[curr.name][curr.branch_name] = Number(curr.revenue);
        return acc;
      }, {});
      setTrendData(Object.values(grouped));
      setLoading(false);
    }).catch(err => {
      console.error("Fetch error:", err);
      setLoading(false);
    });
  }, [franchiseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const branches = ["All", ...branchData.map(b => b.branch_name)];
  const displayed = selected === "All" ? branchData : branchData.filter(b => b.branch_name === selected);

  return (
    <div className="addon-page">
      <div className="addon-header">
        <div>
          <h1>📊 Branch Performance</h1>
          <p className="addon-subtitle">Real-time revenue and profitability tracking</p>
        </div>
        <div className="addon-filter-row" style={{ marginTop: "12px" }}>
          {branches.map(b => (
            <button
              key={b}
              className={`filter-chip ${selected === b ? "active" : ""}`}
              onClick={() => setSelected(b)}
            >{b}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="addon-kpi-grid">
        {loading ? <p>Loading performance...</p> : displayed.map((b, i) => (
          <div key={b.branch_id} className="branch-card glass-card" style={{ borderTop: `4px solid ${COLORS[i % COLORS.length]}` }}>
            <div className="branch-card-header">
              <h3 style={{ fontSize: "16px", color: "#fff" }}>{b.branch_name}</h3>
              <div className="icon-circle" style={{ background: `${COLORS[i % COLORS.length]}20` }}>
                <FiBarChart2 color={COLORS[i % COLORS.length]} size={18} />
              </div>
            </div>
            
            <div className="kpi-row">
              <span>Monthly Revenue</span>
              <strong>₹{Number(b.revenue).toLocaleString()}</strong>
            </div>
            <div className="kpi-row">
              <span>Net Profit</span>
              <strong style={{ color: "#10b981" }}>₹{Number(b.profit).toLocaleString()}</strong>
            </div>
            <div className="kpi-row">
              <span>Profit Margin</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "60px", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ 
                    width: `${b.revenue > 0 ? Math.min(100, Math.round((b.profit / b.revenue) * 100)) : 0}%`, 
                    height: "100%", 
                    background: "#10b981",
                    borderRadius: "3px"
                  }} />
                </div>
                <strong style={{ fontSize: "14px" }}>{b.revenue > 0 ? Math.round((b.profit / b.revenue) * 100) : 0}%</strong>
              </div>
            </div>
            
            <div className="branch-stats-mini" style={{ marginTop: "16px", paddingTop: "16px" }}>
              <div className="stat-item">
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <FiUsers size={12} color="#64748b" />
                  <span>Team Size</span>
                </div>
                <strong>{b.employee_count} Members</strong>
              </div>
              <div className="stat-item">
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <FiMapPin size={12} color="#64748b" />
                  <span>Location</span>
                </div>
                <strong style={{ fontSize: "11px", opacity: 0.9 }}>{b.location}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="addon-two-col">
        {/* Revenue vs Expenses Chart */}
        <div className="addon-chart-box glass-card">
          <h3><FiBarChart2 /> Profitability Matrix</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={branchData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="branch_name" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ 
                  background: "rgba(15, 23, 42, 0.9)", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  borderRadius: "12px",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                }} 
                itemStyle={{ color: "#fff" }}
                formatter={v => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
              <Bar dataKey="revenue" name="Revenue" fill="url(#colorRev)" radius={[6,6,0,0]} barSize={24} />
              <Bar dataKey="profit" name="Net Profit" fill="url(#colorProf)" radius={[6,6,0,0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="addon-chart-box glass-card">
          <h3><FiTrendingUp /> Growth Trajectory</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <defs>
                {branchData.slice(0, 3).map((b, i) => (
                  <linearGradient key={`grad-${i}`} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ 
                  background: "rgba(15, 23, 42, 0.9)", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  borderRadius: "12px",
                  backdropFilter: "blur(8px)"
                }} 
                itemStyle={{ color: "#fff" }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
              {branchData.slice(0, 3).map((b, i) => (
                <Area 
                  key={b.branch_name} 
                  type="monotone" 
                  dataKey={b.branch_name} 
                  stroke={COLORS[i % COLORS.length]} 
                  fillOpacity={1}
                  fill={`url(#color-${i})`}
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BranchPerformance;
