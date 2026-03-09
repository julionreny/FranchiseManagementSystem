import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./Dashboard.css";

import {
  FiHome,
  FiShoppingCart,
  FiBox,
  FiUsers,
  FiDollarSign,
  FiBell,
  FiLogOut,
  FiBarChart2,
  FiFileText,
  FiGlobe
} from "react-icons/fi";

const DashboardLayout = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {

    localStorage.removeItem("user");

    navigate("/login");

  };

  // Standard menu items (shared between manager and owner)
  const sharedItems = (prefix) => [
    { name: "Dashboard",      icon: <FiHome />,         path: `${prefix}` },
    { name: "Sales",          icon: <FiShoppingCart />, path: `${prefix}/sales` },
    { name: "Inventory",      icon: <FiBox />,          path: `${prefix}/inventory` },
    { name: "Employees",      icon: <FiUsers />,        path: `${prefix}/employees` },
    { name: "Expenses",       icon: <FiDollarSign />,   path: `${prefix}/expenses` },
    { name: "Notifications",  icon: <FiBell />,         path: `${prefix}/notifications` },
  ];

  // Owner-only extras
  const ownerExtras = [
    { name: "Manage Branches",    icon: <FiGlobe />,      path: "/owner-dashboard/branches" },
    { name: "Branch Performance", icon: <FiBarChart2 />, path: "/owner-dashboard/performance" },
  ];

  const isOwner = user?.role_id === 1;
  const menu = isOwner ? sharedItems("/owner-dashboard") : sharedItems("/manager-dashboard");
  const extras = isOwner ? ownerExtras : [];


  return (

    <div className="layout">

      {/* SIDEBAR */}

      <div className="sidebar">

        <h2 className="logo">

          FranchiseSys

        </h2>


        <div className="menu">

          {menu.map((item) => (

            <div
              key={item.name}

              className={
                location.pathname === item.path ||
                (location.pathname === "/owner-dashboard" &&
                item.path === "/owner-dashboard") ||
                (location.pathname === "/manager-dashboard" &&
                item.path === "/manager-dashboard")
                ? "menu-item active"
                : "menu-item"
              }

              onClick={() => navigate(item.path)}
            >

              <span className="icon">

                {item.icon}

              </span>

              <span>

                {item.name}

              </span>

            </div>

          ))}

          {/* OWNER EXTRAS */}
          {extras.length > 0 && (
            <>
              <div style={{
                margin: "14px 0 8px 0",
                padding: "0 4px",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                color: "#475569",
                borderTop: "1px solid #1e293b",
                paddingTop: "14px"
              }}>
                Owner Tools
              </div>
              {extras.map((item) => (
                <div
                  key={item.name}
                  className={location.pathname === item.path ? "menu-item active" : "menu-item"}
                  onClick={() => navigate(item.path)}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
              ))}
            </>
          )}


          <div className="menu-item logout" onClick={logout}>

            <FiLogOut />

            Logout

          </div>

        </div>

      </div>


      {/* MAIN */}

      <div className="main">
        
        <div className="content">

          <Outlet />

        </div>

      </div>

    </div>

  );

};

export default DashboardLayout;