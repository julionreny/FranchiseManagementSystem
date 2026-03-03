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


  // Build menu based on user role
  const getMenu = () => {
    const basePrefix = user?.role_id === 1 ? "/owner-dashboard" : "/manager-dashboard";
    
    const baseMenu = [
      {
        name: "Dashboard",
        icon: <FiHome />,
        path: `${basePrefix}`
      },
      {
        name: "Sales",
        icon: <FiShoppingCart />,
        path: `${basePrefix}/sales`
      },
      {
        name: "Inventory",
        icon: <FiBox />,
        path: `${basePrefix}/inventory`
      },
      {
        name: "Employees",
        icon: <FiUsers />,
        path: `${basePrefix}/employees`
      },
      {
        name: "Expenses",
        icon: <FiDollarSign />,
        path: `${basePrefix}/expenses`
      },
      {
        name: "Notifications",
        icon: <FiBell />,
        path: `${basePrefix}/notifications`
      }
    ];

    return baseMenu;
  };

  const menu = getMenu();


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