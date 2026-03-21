import { useEffect, useState, useCallback } from "react";
import { getOwnerBranchPerformance } from "../../services/dashboardService";
import {
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, Bar
} from "recharts";
import { FiBarChart2, FiUsers, FiMapPin } from "react-icons/fi";
import "./OwnerAddOns.css";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];

const BranchPerformance = () => {

  const [branchData, setBranchData] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const franchiseId = user?.franchise_id;

  const fetchData = useCallback(() => {
    if (!franchiseId) return;

    setLoading(true);

    getOwnerBranchPerformance(franchiseId)
      .then(res => {
        setBranchData(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Performance fetch error:", err);
        setLoading(false);
      });

  }, [franchiseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="addon-page">

      <div className="addon-header">
        <h1>📊 Branch Performance</h1>
        <p className="addon-subtitle">
          Revenue and profitability overview of all branches
        </p>
      </div>

      {/* KPI Cards */}
      <div className="addon-kpi-grid">

        {loading ? (
          <p>Loading performance...</p>
        ) : (
          branchData.map((b, i) => (

            <div
              key={b.branch_id}
              className="branch-card glass-card"
              style={{ borderTop: `4px solid ${COLORS[i % COLORS.length]}` }}
            >

              <div className="branch-card-header">
                <h3>{b.branch_name}</h3>
                <FiBarChart2 color={COLORS[i % COLORS.length]} />
              </div>

              <div className="kpi-row">
                <span>Monthly Revenue</span>
                <strong>₹{Number(b.revenue).toLocaleString()}</strong>
              </div>

              <div className="kpi-row">
                <span>Net Profit</span>
                <strong style={{ color: "#10b981" }}>
                  ₹{Number(b.profit).toLocaleString()}
                </strong>
              </div>

              <div className="kpi-row">
                <span>Profit Margin</span>
                <strong>
                  {b.revenue > 0
                    ? Math.round((b.profit / b.revenue) * 100)
                    : 0}%
                </strong>
              </div>

              <div className="branch-stats-mini">
                <div className="stat-item">
                  <FiUsers size={14} />
                  <span>{b.employee_count} Members</span>
                </div>

                <div className="stat-item">
                  <FiMapPin size={14} />
                  <span>{b.location}</span>
                </div>
              </div>

            </div>

          ))
        )}

      </div>

      {/* Profitability Matrix Chart */}
      <div className="addon-chart-box glass-card">

        <h3>📊 Profitability Matrix</h3>

        <ResponsiveContainer width="100%" height={350}>

          <BarChart data={branchData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="branch_name" />

            <YAxis
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip
              formatter={(v) =>
                `₹${Number(v).toLocaleString("en-IN")}`
              }
            />

            <Legend />

            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />

            <Bar dataKey="profit" fill="#10b981" name="Net Profit" />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default BranchPerformance;