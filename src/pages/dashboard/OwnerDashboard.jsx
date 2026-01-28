import DashboardLayout from "./DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";

const OwnerDashboard = () => {
  return (
    <DashboardLayout>
      <h1>Owner Dashboard</h1>

      <div className="stats-grid">
        <StatCard title="Total Franchises" value="1" />
        <StatCard title="Total Branches" value="5" />
        <StatCard title="Total Sales" value="₹1,20,000" />
        <StatCard title="Employees" value="45" />
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
