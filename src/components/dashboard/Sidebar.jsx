import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <h2 className="logo">FranchiseSys</h2>

      <ul className="sidebar-menu">
        <li onClick={() => navigate("/owner-dashboard")}>Dashboard</li>
        <li onClick={() => navigate("/sales")}>Sales</li>
        <li>Inventory</li>
        <li>Employees</li>
        <li>Expenses</li>
        <li>Notifications</li>
        <li onClick={() => navigate("/login")}>Logout</li>
      </ul>
    </aside>
  );
};

export default Sidebar;
