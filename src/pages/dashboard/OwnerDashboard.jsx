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
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { getOwnerFranchise } from "../../services/franchiseService";
import { getOwnerStats, getOwnerBranchTrend } from "../../services/dashboardService";
import "./OwnerDashboard.css";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [franchise, setFranchise] = useState(null);
  const [stats, setStats] = useState(null);
  const [areaData, setAreaData] = useState([]);
  const [loading, setLoading] = useState(true);

  const PIE_COLORS = ["#14532d", "#475569", "#ca8a04", "#7f1d1d", "#0f766e"];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role_id !== 1) {
      alert("Unauthorized access");
      navigate("/login");
      return;
    }

    setLoading(true);
    getOwnerFranchise(user.user_id)
      .then((res) => {
        setFranchise(res.data);
        if (res.data?.franchise_id) {
          const fid = res.data.franchise_id;
          return Promise.all([
            getOwnerStats(fid),
            getOwnerBranchTrend(fid)
          ]);
        }
      })
      .then((results) => {
        if (results) {
          const [s, t] = results;
          setStats(s.data);
          
          // Transform trend data for area chart
          const grouped = t.data.reduce((acc, curr) => {
            if (!acc[curr.name]) acc[curr.name] = { name: curr.name };
            acc[curr.name][curr.branch_name] = Number(curr.revenue);
            return acc;
          }, {});
          setAreaData(Object.values(grouped));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard error:", err);
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div className="owner-dashboard-wrapper">
      <h1 className="owner-dashboard-title">
        Franchise Owner Strategic Dashboard
      </h1>

      {/* STAT CARDS */}
      <div className="owner-stats-grid">
        <div className="owner-stat-card green">
          <h4>Total System Revenue</h4>
          <div className="owner-stat-value">
            <span>₹{(stats?.totalRevenue || 0).toLocaleString()}</span>
            <div className="mini-chart">📈</div>
          </div>
        </div>

        <div className="owner-stat-card slate">
          <h4>Active Locations</h4>
          <div className="owner-stat-value">
            <span>
              {stats?.activeBranches || 0}/{stats?.totalBranches || 0} <span className="stat-subtext">operating</span>
            </span>
            <div className="circle-progress">{stats?.totalBranches > 0 ? Math.round((stats.activeBranches/stats.totalBranches)*100) : 0}%</div>
          </div>
        </div>

        <div className="owner-stat-card yellow">
          <h4>Operating Efficiency Score</h4>
          <div className="owner-stat-value">
            <span>{stats?.efficiencyScore || 0}%</span>
            <svg
              className="mini-sparkline"
              viewBox="0 0 60 30"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M0,25 L10,20 L20,22 L30,10 L40,15 L50,5 L60,8" />
            </svg>
          </div>
        </div>

        <div className="owner-stat-card red">
          <h4>Total Employees (System)</h4>
          <div className="owner-stat-value">
            <span>{stats?.totalEmployees || 0}</span>
            <div className="mini-chart">●</div>
          </div>
        </div>

      </div>

      {/* CHARTS */}
      <div className="owner-chart-grid">
        {/* AREA CHART */}
        <div className="owner-chart-box" style={{ gridColumn: "span 2" }}>
          <div className="owner-chart-header">
            <h3 className="owner-chart-title">Multi-Branch Performance (Last 30 Days)</h3>
            <span className="owner-chart-total">Total: ₹{(stats?.totalRevenue || 0).toLocaleString()}</span>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <defs>
                {/* Simplified gradients */}
                <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px", color: "#e2e8f0" }} />
              {areaData.length > 0 && Object.keys(areaData[0]).filter(k => k !== 'name').map((branch, i) => (
                <Area 
                  key={branch} 
                  type="monotone" 
                  dataKey={branch} 
                  name={branch} 
                  stroke={PIE_COLORS[i % PIE_COLORS.length]} 
                  fillOpacity={0.2} 
                  fill={PIE_COLORS[i % PIE_COLORS.length]} 
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
