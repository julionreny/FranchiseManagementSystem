import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { getOwnerFranchise } from "../../services/franchiseService";
import { getOwnerStats, getOwnerBranchTrend } from "../../services/dashboardService";
import "./OwnerDashboard.css";

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [areaData, setAreaData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7"];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role_id !== 1) {
      alert("Unauthorized");
      navigate("/login");
      return;
    }

    setLoading(true);

    getOwnerFranchise(user.user_id)
      .then(res => {
        const fid = res.data?.franchise_id;
        if (!fid) throw new Error("No franchise");

        return Promise.all([
          getOwnerStats(fid),
          getOwnerBranchTrend(fid)
        ]);
      })
      .then(([statsRes, trendRes]) => {
        setStats(statsRes.data);

        const grouped = {};

        trendRes.data.forEach(row => {
          const date = new Date(row.sale_date);

          const label = date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short"
          });

          if (!grouped[label])
            grouped[label] = { name: label, rawDate: date };

          grouped[label][row.branch_name] = Number(row.revenue);
        });

        const sorted = Object.values(grouped)
          .sort((a, b) => a.rawDate - b.rawDate)
          .map(({ rawDate, ...rest }) => rest);

        setAreaData(sorted);

        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard error:", err);
        setLoading(false);
      });

  }, [navigate]);

  // Handle Legend Click for Toggling Visibility
  const [hiddenBranches, setHiddenBranches] = useState(new Set());
  const toggleBranch = (o) => {
    const { dataKey } = o;
    const newHidden = new Set(hiddenBranches);
    if (newHidden.has(dataKey)) newHidden.delete(dataKey);
    else newHidden.add(dataKey);
    setHiddenBranches(newHidden);
  };

  return (
    <div className="owner-dashboard-wrapper">

      <h1 className="owner-dashboard-title">
        Franchise Owner Strategic Dashboard
      </h1>

      {/* ===== STAT CARDS ===== */}
      <div className="owner-stats-grid">
        <div className="owner-stat-card green">
          <h4>Total System Revenue</h4>
          <div className="owner-stat-value">
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </div>
        </div>

        <div className="owner-stat-card slate">
          <h4>Active Locations</h4>
          <div className="owner-stat-value">
            {stats?.activeBranches || 0}/{stats?.totalBranches || 0}
          </div>
        </div>

        <div className="owner-stat-card yellow">
          <h4>Operating Efficiency</h4>
          <div className="owner-stat-value">
            {stats?.efficiencyScore || 0}%
          </div>
        </div>

        <div className="owner-stat-card red">
          <h4>Total Employees</h4>
          <div className="owner-stat-value">
            {stats?.totalEmployees || 0}
          </div>
        </div>
      </div>

      {/* ===== CHART ===== */}
      <div className="owner-chart-grid">
        <div className="owner-chart-box" style={{ gridColumn: "span 2" }}>
          <div className="owner-chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 className="owner-chart-title" style={{ margin: 0 }}>
                Aggregate Network Revenue (90 Days)
              </h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                Stacked view showing individual branch contributions. Click legend to filter.
              </p>
            </div>
            <span className="owner-chart-total" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold" }}>
              Total ₹{(stats?.totalRevenue || 0).toLocaleString()}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
              Loading aggregate trajectory...
            </div>
          ) : areaData.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
              No sales data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={areaData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  {Object.keys(areaData[0]).filter(k => k !== "name").map((branch, i) => (
                    <linearGradient key={`grad-${branch}`} id={`color-${branch.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  interval={Math.floor(areaData.length / 10)}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
                />

                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    padding: "16px"
                  }}
                  itemStyle={{ fontSize: "12px", color: "#f8fafc" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold", marginBottom: "8px" }}
                />

                <Legend 
                  onClick={toggleBranch}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "30px", cursor: "pointer", userSelect: "none" }} 
                  formatter={(value) => (
                    <span style={{ 
                      color: hiddenBranches.has(value) ? "#475569" : "#e2e8f0",
                      textDecoration: hiddenBranches.has(value) ? "line-through" : "none",
                      fontSize: "12px",
                      opacity: hiddenBranches.has(value) ? 0.5 : 1
                    }}>
                      {value}
                    </span>
                  )}
                />

                {Object.keys(areaData[0])
                  .filter(k => k !== "name")
                  .map((branch, i) => (
                    <Area
                      key={branch}
                      type="monotone"
                      dataKey={branch}
                      stackId="1"
                      stroke={COLORS[i % COLORS.length]}
                      fill={`url(#color-${branch.replace(/\s+/g, '-')})`}
                      strokeWidth={1}
                      hide={hiddenBranches.has(branch)}
                    />
                  ))}

              </AreaChart>
            </ResponsiveContainer>
          )}

        </div>

      </div>

    </div>
  );
};

export default OwnerDashboard;