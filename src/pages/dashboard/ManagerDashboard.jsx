import DashboardLayout from "./DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";

const ManagerDashboard = () => {
  return (
    <DashboardLayout>
      <h1>Manager Dashboard</h1>

      <div className="stats-grid">
        <StatCard title="Today's Sales" value="₹12,000" />
        <StatCard title="Inventory Items" value="120" />
        <StatCard title="Employees" value="8" />
        <StatCard title="Expenses" value="₹3,500" />
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
