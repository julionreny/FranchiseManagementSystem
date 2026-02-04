import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import "./Dashboard.css";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    // If user is not logged in, redirect to login
    if (!storedUser) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

