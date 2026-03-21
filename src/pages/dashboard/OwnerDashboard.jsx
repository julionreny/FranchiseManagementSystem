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

          <div className="owner-chart-header">
            <h3 className="owner-chart-title">
              Multi-Branch Performance (Last 30 Days)
            </h3>

            <span className="owner-chart-total">
              Total ₹{(stats?.totalRevenue || 0).toLocaleString()}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              Loading chart...
            </div>
          ) : areaData.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              No sales data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={areaData}>

                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  angle={-40}
                  textAnchor="end"
                  height={60}
                />

                <YAxis stroke="#94a3b8" />

                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155"
                  }}
                />

                <Legend />

                {Object.keys(areaData[0])
                  .filter(k => k !== "name")
                  .map((branch, i) => (
                    <Area
                      key={branch}
                      type="monotone"
                      dataKey={branch}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.25}
                      strokeWidth={3}
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