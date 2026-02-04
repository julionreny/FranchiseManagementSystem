import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    alert("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <h2 className="logo">FranchiseSys</h2>

      <ul className="sidebar-menu">
        {/* DASHBOARD */}
        {user?.role_id === 1 && (
          <li onClick={() => navigate("/owner-dashboard")}>
            Dashboard
          </li>
        )}

        {user?.role_id === 2 && (
          <li onClick={() => navigate("/manager-dashboard")}>
            Dashboard
          </li>
        )}

        {/* COMMON MODULES */}
        <li onClick={() => navigate("/sales")}>Sales</li>
        <li onClick={() => navigate("/inventory")}>Inventory</li>
        <li onClick={() => navigate("/employees")}>Employees</li>
        <li onClick={() => navigate("/expenses")}>Expenses</li>
        <li onClick={() => navigate("/notifications")}>
          Notifications
        </li>

        {/* LOGOUT */}
        <li onClick={handleLogout} style={{ color: "#ef4444" }}>
          Logout
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
