import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // normalize role_id (important)
  const roleId = Number(user?.role_id);

  const isOwner = roleId === 1;
  const isManager = roleId === 2;

  // base dashboard path
  const basePath = isOwner
    ? "/owner-dashboard"
    : "/manager-dashboard";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <h2 className="logo">FranchiseSys</h2>

      <ul className="sidebar-menu">
        {/* DASHBOARD */}
        <li onClick={() => navigate(basePath)}>Dashboard</li>

        {/* COMMON MODULES (OWNER + MANAGER) */}
        {(isOwner || isManager) && (
          <>
            <li onClick={() => navigate(`${basePath}/sales`)}>
              Sales
            </li>
            <li onClick={() => navigate(`${basePath}/inventory`)}>
              Inventory
            </li>
            <li onClick={() => navigate(`${basePath}/employees`)}>
              Employees
            </li>
            <li onClick={() => navigate(`${basePath}/expenses`)}>
              Expenses
            </li>
            <li
              onClick={() =>
                navigate(`${basePath}/notifications`)
              }
            >
              Notifications
            </li>
          </>
        )}

        {/* LOGOUT */}
        <li onClick={handleLogout} style={{ color: "#ef4444" }}>
          Logout
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
