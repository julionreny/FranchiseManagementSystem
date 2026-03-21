import { useEffect, useState } from "react";
import axios from "axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import "./Dashboard.css";

const COLORS = [
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

const ManagerDashboard = () => {

  const user = JSON.parse(localStorage.getItem("user"));
  const branchId = user?.branch_id;

  /* STATE */

  const [summary, setSummary] = useState({
    todaySales: 0,
    monthlySales: 0,
    inventoryCount: 0,
    employeeCount: 0,
  });

  const [salesData, setSalesData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);

  /* ⭐ ML STATES */
  const [product, setProduct] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  /* FETCH DASHBOARD DATA */

  useEffect(() => {
    if (!branchId) return;

    fetchSummary();
    fetchSalesChart();
    fetchExpenseBreakdown();
  }, [branchId]);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/dashboard/summary/${branchId}`
      );
      setSummary(res.data);
    } catch (err) {
      console.error("Summary error:", err);
    }
  };

  const fetchSalesChart = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/dashboard/sales-last-7-days/${branchId}`
      );
      setSalesData(res.data);
    } catch (err) {
      console.error("Sales chart error:", err);
    }
  };

  const fetchExpenseBreakdown = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/dashboard/expense-breakdown/${branchId}`
      );
      setExpenseData(res.data);
    } catch (err) {
      console.error("Expense breakdown error:", err);
    }
  };

  /* ⭐ ML PREDICTION FUNCTION */

  const handlePredictDemand = async () => {
    try {
      if (!product) {
        alert("Select product");
        return;
      }

      setLoadingPrediction(true);

      const body = {
        total_sales: summary.todaySales || 1000,
        month: new Date().getMonth() + 1,
        day_of_week: new Date().getDay(),
        lag_1: 1,
        lag_3: 1,
        lag_7: 1,
        product: product,
        branch_id: branchId
      };

      const res = await axios.post(
        "http://localhost:5000/api/ml/predict-demand",
        body
      );

      setPrediction(res.data.predicted_demand);
      setLoadingPrediction(false);

    } catch (err) {
      console.log(err);
      alert("Prediction failed");
      setLoadingPrediction(false);
    }
  };

  return (
    <div className="dashboard-container">

      <h1 className="dashboard-title">
        Branch Manager Dashboard
      </h1>

      {/* STAT CARDS */}
      <div className="stats-grid">

        <div className="stat-card blue">
          <h4>Today's Sales</h4>
          <p>₹{Number(summary.todaySales).toLocaleString("en-IN")}</p>
        </div>

        <div className="stat-card green">
          <h4>Monthly Sales</h4>
          <p>₹{Number(summary.monthlySales).toLocaleString("en-IN")}</p>
        </div>

        <div className="stat-card orange">
          <h4>Inventory Items</h4>
          <p>{summary.inventoryCount}</p>
        </div>

        <div className="stat-card red">
          <h4>Employees</h4>
          <p>{summary.employeeCount}</p>
        </div>

      </div>

      {/* ⭐ ML DEMAND PREDICTION CARD */}

      

      {/* CHART SECTION */}

      <div className="chart-grid">

        <div className="chart-box">
          <h3>Sales Overview (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip formatter={(value) =>
                `₹${Number(value).toLocaleString("en-IN")}`} />
              <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Expense Breakdown</h3>

          {expenseData.length === 0 ? (
            <p>No expense data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={index}
                      fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) =>
                  `₹${Number(value).toLocaleString("en-IN")}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

        </div>

      </div>

    </div>
  );
};

export default ManagerDashboard;