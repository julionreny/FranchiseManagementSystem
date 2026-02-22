import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./Dashboard.css";

import {
  FiHome,
  FiShoppingCart,
  FiBox,
  FiUsers,
  FiDollarSign,
  FiBell,
  FiLogOut
} from "react-icons/fi";

const DashboardLayout = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {

    localStorage.removeItem("user");

    navigate("/login");

  };


  const menu = [

    {
      name: "Dashboard",
      icon: <FiHome />,
      path: "/manager-dashboard/dashboard"
    },

    {
      name: "Sales",
      icon: <FiShoppingCart />,
      path: "/manager-dashboard/sales"
    },

    {
      name: "Inventory",
      icon: <FiBox />,
      path: "/manager-dashboard/inventory"
    },

    {
      name: "Employees",
      icon: <FiUsers />,
      path: "/manager-dashboard/employees"
    },

    {
      name: "Expenses",
      icon: <FiDollarSign />,
      path: "/manager-dashboard/expenses"
    },

    {
      name: "Notifications",
      icon: <FiBell />,
      path: "/manager-dashboard/notifications"
    }

  ];


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
                (location.pathname === "/manager-dashboard" &&
                item.path === "/manager-dashboard/dashboard")
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