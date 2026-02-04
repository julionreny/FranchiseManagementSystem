import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";

const ManagerDashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || storedUser.role_id !== 2) {
      alert("Unauthorized access");
      return;
    }

    setUser(storedUser);
  }, []);

  if (!user) {
    return <p style={{ padding: "20px" }}>Loading dashboard...</p>;
  }

  return (
    <DashboardLayout>
      <h1>Branch Manager Dashboard</h1>

      <div className="stats-grid">
        <StatCard title="Branch ID" value={user.branch_id} />
        <StatCard title="Today's Sales" value="₹25,000" />
        <StatCard title="Inventory Items" value="120" />
        <StatCard title="Employees" value="10" />
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
